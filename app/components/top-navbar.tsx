'use client';

import { LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth/auth-context';

/**
 * Top navigation bar with user menu and logout button.
 *
 * - Displays authenticated user's name/email
 * - Provides account settings link
 * - Provides logout functionality
 * - Works with both Clerk and Auth0
 */
export function TopNavbar() {
  const { user, signOutUrl } = useAuth();

  if (!user) {
    return null;
  }

  const displayName = user.name || user.email || 'User';

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand/Logo Section */}
        <div className="flex-1">
          <Link href="/" className="font-bold text-lg">
            Vintasend Dashboard
          </Link>
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 rounded-full" title={displayName}>
              {user.imageUrl && (
                <Image
                  src={user.imageUrl}
                  alt={user.name || 'User avatar'}
                  className="w-8 h-8 rounded-full"
                  width={32}
                  height={32}
                />
              )}
              <span className="hidden sm:inline text-sm">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* User Info */}
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="font-semibold">{user.name || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem asChild>
              <a
                href={signOutUrl}
                className="cursor-pointer flex items-center gap-2 text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
