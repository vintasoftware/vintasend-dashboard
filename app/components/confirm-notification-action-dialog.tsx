'use client';

import type { LucideIcon } from 'lucide-react';
import { useTransition } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ConfirmNotificationActionDialogProps {
  /**
   * The notification ID to act on. When set, the dialog opens.
   */
  notificationId: string | null;

  /**
   * Callback fired when the dialog should close.
   */
  onClose: () => void;

  /**
   * Callback fired when the action is confirmed. The dialog stays open, with
   * its buttons disabled, until it settles; closing it is the caller's call.
   */
  onConfirm: (id: string) => Promise<void>;

  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;

  /**
   * `data-testid` of the confirm button.
   */
  confirmTestId: string;
}

/**
 * Confirmation dialog for a one-step notification action, such as a requeue or
 * a repin.
 */
export function ConfirmNotificationActionDialog({
  notificationId,
  onClose,
  onConfirm,
  icon: Icon,
  title,
  description,
  confirmLabel,
  pendingLabel,
  confirmTestId,
}: ConfirmNotificationActionDialogProps) {
  const [isPending, startTransition] = useTransition();

  const isOpen = notificationId !== null;

  const handleConfirm = () => {
    if (!notificationId) {
      return;
    }

    startTransition(async () => {
      await onConfirm(notificationId);
    });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isPending) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Close</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            data-testid={confirmTestId}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
