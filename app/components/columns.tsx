'use client';

import { type ColumnDef, rowSortingFeature, tableFeatures } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  ArrowUpDown,
  ChevronDown,
  Eye,
  FileText,
  HashIcon,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  Notification,
  NotificationStatus,
  NotificationType,
  OneOffNotification,
} from 'vintasend-dashboard-core';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/**
 * Maps notification status to badge variant colors.
 */
const statusVariantMap: Record<
  NotificationStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING_SEND: 'default',
  SENT: 'secondary',
  FAILED: 'destructive',
  READ: 'outline',
  CANCELLED: 'secondary',
};

/**
 * Maps notification type to badge variant colors.
 */
const typeVariantMap: Record<
  NotificationType,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  EMAIL: 'default',
  SMS: 'secondary',
  PUSH: 'outline',
  IN_APP: 'default',
};

/**
 * Formats a date string (ISO format) for display.
 * Returns empty string if date is null/undefined.
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return '—';
  }
}

/**
 * Determines if a notification is one-off or regular.
 */
function isOneOff(notification: Notification): notification is OneOffNotification {
  return notification.kind === 'one-off';
}

/**
 * Gets the recipient identifier for display.
 */
function getRecipient(notification: Notification): string {
  return (isOneOff(notification) ? notification.emailOrPhone : notification.userId) || '—';
}

function canPreviewRender(
  notification: Notification,
  onPreviewRender?: (id: string) => void,
): boolean {
  if (!onPreviewRender) {
    return false;
  }

  if (notification.gitCommitSha) {
    return true;
  }

  return notification.status === 'PENDING_SEND';
}

/**
 * Options for generating column definitions.
 */
export interface ColumnOptions {
  /**
   * Callback fired when "View Details" is clicked.
   */
  onViewDetails?: (id: string) => void;

  /**
   * Callback fired when "Resend" is clicked.
   * Only shown for non-one-off notifications with status SENT or FAILED.
   */
  onResend?: (id: string) => void;

  /**
   * Callback fired when "Preview render" is clicked.
   */
  onPreviewRender?: (id: string) => void;

  /**
   * Callback fired when "Cancel" is clicked.
   * Only shown for notifications with status PENDING_SEND.
   */
  onCancel?: (id: string) => void;
}

function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: { toggleSorting: (desc?: boolean) => void; getIsSorted: () => false | 'asc' | 'desc' };
}) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="h-8 -ml-3"
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );
}

/**
 * The TanStack Table features the notifications table uses. Sorting is the only
 * one: the API paginates and filters, and the sortable headers drive its
 * `orderByField`, so the table itself only has to track the sort state.
 */
export const notificationTableFeatures = tableFeatures({ rowSortingFeature });

export type NotificationTableFeatures = typeof notificationTableFeatures;

/**
 * Creates TanStack column definitions for the notifications table.
 * Accepts options for action callbacks.
 */
export function createColumns(
  options: ColumnOptions = {},
): ColumnDef<NotificationTableFeatures, Notification>[] {
  const { onViewDetails, onResend, onPreviewRender, onCancel } = options;

  const columns: ColumnDef<NotificationTableFeatures, Notification>[] = [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span>,
    },

    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <span className="truncate block max-w-[10rem]" title={row.original.title || undefined}>
          {row.original.title || '—'}
        </span>
      ),
    },

    {
      accessorKey: 'notificationType',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.notificationType;
        return <Badge variant={typeVariantMap[type]}>{type}</Badge>;
      },
    },

    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={statusVariantMap[status]}>{status}</Badge>;
      },
    },

    {
      accessorKey: 'contextName',
      header: 'Context',
      cell: ({ row }) => (
        <span className="truncate block max-w-[7rem]" title={row.original.contextName || undefined}>
          {row.original.contextName || '—'}
        </span>
      ),
    },

    {
      accessorKey: 'tenant',
      header: 'Tenant',
      cell: ({ row }) => (
        <span className="truncate block max-w-[7rem]" title={row.original.tenant || undefined}>
          {row.original.tenant || '—'}
        </span>
      ),
    },

    {
      accessorKey: 'recipient',
      header: 'Recipient ID',
      cell: ({ row }) => {
        const recipient = getRecipient(row.original);
        return (
          <span className="truncate block max-w-[12rem]" title={recipient}>
            {recipient}
          </span>
        );
      },
    },

    {
      accessorKey: 'sendAfter',
      header: ({ column }) => <SortableHeader label="Send After" column={column} />,
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">{formatDate(row.original.sendAfter)}</span>
      ),
    },

    {
      accessorKey: 'sentAt',
      header: ({ column }) => <SortableHeader label="Sent At" column={column} />,
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">{formatDate(row.original.sentAt)}</span>
      ),
    },

    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortableHeader label="Created At" column={column} />,
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">{formatDate(row.original.createdAt)}</span>
      ),
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(row.original.id);
              }}
              disabled={!onViewDetails}
              data-testid={`view-details-${row.original.id}`}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(row.original.id);
                toast.success('Notification ID copied to clipboard');
              }}
            >
              <HashIcon className="h-4 w-4 mr-2" />
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (!canPreviewRender(row.original, onPreviewRender)) {
                  return;
                }
                onPreviewRender?.(row.original.id);
              }}
              disabled={!canPreviewRender(row.original, onPreviewRender)}
              data-testid={`preview-render-${row.original.id}`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview render
            </DropdownMenuItem>
            {onResend &&
              !isOneOff(row.original) &&
              (row.original.status === 'SENT' || row.original.status === 'FAILED') && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onResend(row.original.id);
                    }}
                    data-testid={`resend-${row.original.id}`}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend
                  </DropdownMenuItem>
                </>
              )}
            {onCancel && row.original.status === 'PENDING_SEND' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel(row.original.id);
                  }}
                  data-testid={`cancel-${row.original.id}`}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return columns;
}

/**
 * Default columns without action callbacks (for backward compatibility).
 * @deprecated Use createColumns() with options instead.
 */
export const columns = createColumns();
