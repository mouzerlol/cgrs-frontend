'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { SignOutButton, useAuth, useUser, UserAvatar } from '@clerk/nextjs';
import { getAfterSignOutUrl } from '@/lib/app-url';
import Icon from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import { getNotificationCount } from '@/lib/api/verification';

const profileLinkIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0 text-forest/70"
    aria-hidden="true"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);


/**
 * App-controlled account menu with notification badge for verification requests.
 */
export default function ClerkAppUserButton() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [afterSignOutUrl, setAfterSignOutUrl] = useState(() => getAfterSignOutUrl());
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const o = window.location.origin;
    setAfterSignOutUrl(`${o}/login/?redirect_url=${encodeURIComponent(`${o}/`)}`);
  }, []);

  useEffect(() => {
    async function loadNotificationCount() {
      if (!isLoaded || !user) return;
      try {
        const token = await getToken();
        const data = await getNotificationCount(async () => token);
        setNotificationCount(data.count);
      } catch {
        // Silently fail
      }
    }
    loadNotificationCount();
  }, [isLoaded, user, getToken]);

  if (!isLoaded) {
    return <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-bone/20" aria-hidden="true" />;
  }

  if (!user) return null;

  const primary = user.primaryEmailAddress?.emailAddress ?? '';
  const display =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || primary || 'Account';

  return (
    <Menu as="div" className="relative">
      <MenuButton
        type="button"
        aria-label={primary ? `Account menu for ${display}, ${primary}` : `Account menu for ${display}`}
        className={cn(
          'relative flex items-center justify-center rounded-full p-0.5 transition-colors',
          'text-bone hover:bg-white/10',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/40'
        )}
      >
        <UserAvatar />
        {notificationCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-bone shadow-sm">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
        <span
          className="pointer-events-none absolute -bottom-px -right-px flex h-[18px] w-[18px] items-center justify-center rounded-full border border-forest/20 bg-sage text-forest shadow-sm"
          aria-hidden="true"
        >
          <Icon name="chevron-down" size="sm" />
        </span>
      </MenuButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems
          className={cn(
            'absolute right-0 z-[1100] mt-2 w-[min(100vw-2rem,20rem)] origin-top-right rounded-2xl border border-sage/30',
            'bg-sage-light shadow-[0_20px_60px_rgba(26,34,24,0.12)] focus:outline-none'
          )}
        >
          <div className="border-b border-sage/20 px-4 py-3 sm:hidden">
            <p className="font-display text-sm font-medium text-forest">{display}</p>
            {primary ? <p className="truncate text-xs text-forest/60">{primary}</p> : null}
          </div>
          <div className="p-1">
            <MenuItem>
              {({ focus }) => (
                <Link
                  href="/profile"
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                    focus ? 'bg-sage/30 text-forest' : 'text-forest'
                  )}
                >
                  {profileLinkIcon}
                  My Profile
                  {notificationCount > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-bone">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </Link>
              )}
            </MenuItem>
            <MenuItem>
              {({ focus }) => (
                <SignOutButton redirectUrl={afterSignOutUrl}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium',
                      focus ? 'bg-sage/30 text-forest' : 'text-forest'
                    )}
                  >
                    Sign out
                  </button>
                </SignOutButton>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
}
