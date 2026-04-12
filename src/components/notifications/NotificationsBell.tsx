'use client';

import { Fragment, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogPanel, Popover, PopoverButton, PopoverPanel, Transition, TransitionChild } from '@headlessui/react';
import { Bell, X } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import { useNotifications, useUnreadCount, useMarkRead } from '@/hooks/useNotifications';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { NotificationItem } from '@/lib/api/notifications';

/** Matches desktop account avatar (28px): thin sage ring, subtle fill on forest header. */
const NOTIFICATION_TRIGGER_CLASS = cn(
  'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
  'ring-1 ring-sage/30 bg-white/5 text-bone',
  'transition-colors hover:bg-white/10',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/40'
);

function formatTimeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function NotificationRow({ item, onClose }: { item: NotificationItem; onClose: () => void }) {
  const router = useRouter();
  const markRead = useMarkRead();

  function handleClick() {
    if (!item.is_read) {
      markRead.mutate({ notification_ids: [item.id] });
    }
    onClose();
    router.push(`${item.action_path}?notification_id=${item.id}`);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-sage/20 border-b border-bone/10 last:border-b-0',
        !item.is_read && 'bg-terracotta/5'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!item.is_read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-terracotta" aria-hidden="true" />
          )}
          <p className={cn('text-sm truncate', item.is_read ? 'text-forest/60' : 'text-forest font-medium')}>
            {item.title}
          </p>
        </div>
        <p className={cn('text-xs mt-0.5 line-clamp-2', item.is_read ? 'text-forest/40' : 'text-forest/70')}>
          {item.body}
        </p>
        <p className="text-[10px] text-forest/40 mt-1">{formatTimeAgo(item.created_at)}</p>
      </div>
    </button>
  );
}

interface NotificationsPanelProps {
  items: NotificationItem[];
  isLoading: boolean;
  onClose: () => void;
}

function NotificationsPanel({ items, isLoading, onClose }: NotificationsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-bone/10">
        <h2 className="font-display text-base text-forest">Notifications</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notifications"
          className="p-1 rounded text-forest/60 hover:text-forest hover:bg-sage/20 transition-colors"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-forest/10">
              <div className="h-3 w-3 animate-pulse rounded-full bg-forest/30" />
            </div>
            <p className="text-xs text-forest/50 mt-2">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-forest/20" strokeWidth={1.5} aria-hidden />
            <p className="text-sm text-forest/50 mt-2">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-bone/10">
            {items.map((item) => (
              <NotificationRow key={item.id} item={item} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsBell({ className }: { className?: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const [panelOpen, setPanelOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { data: unreadData } = useUnreadCount();
  const { data: notificationsData, isLoading } = useNotifications({ limit: 20 });
  const markRead = useMarkRead();

  if (!isLoaded || !isSignedIn) return null;

  const count = unreadData?.total ?? 0;
  const items = notificationsData?.items ?? [];

  function handleClose() {
    const hasUnread = items.some((item) => !item.is_read);
    if (hasUnread) {
      markRead.mutate({ nav_section: 'profile_verification' });
    }
    setPanelOpen(false);
  }

  return (
    <>
      <Tooltip content="Notifications" position="bottom">
        {isDesktop ? (
          <Popover as="div" className={cn('relative', className)}>
            <PopoverButton
              type="button"
              aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
              className={NOTIFICATION_TRIGGER_CLASS}
            >
              <Bell className="h-4 w-4" strokeWidth={2} aria-hidden />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[9px] font-bold text-bone shadow-sm">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </PopoverButton>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <PopoverPanel
                className={cn(
                  'absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)]',
                  'origin-top-right rounded-2xl border border-white/10',
                  'bg-bone shadow-[0_20px_60px_rgba(26,34,24,0.18)]',
                  'flex flex-col overflow-hidden',
                  'focus:outline-none'
                )}
              >
                <NotificationsPanel
                  items={items}
                  isLoading={isLoading}
                  onClose={handleClose}
                />
              </PopoverPanel>
            </Transition>
          </Popover>
        ) : (
          <>
            <button
              type="button"
              aria-label={`Notifications${count > 0 ? `, ${count} unread` : ''}`}
              onClick={() => setPanelOpen(true)}
              className={cn(NOTIFICATION_TRIGGER_CLASS, className)}
            >
              <Bell className="h-4 w-4" strokeWidth={2} aria-hidden />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[9px] font-bold text-bone shadow-sm">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            <Transition show={panelOpen} as={Fragment}>
              <Dialog as="div" className="relative z-[1000]" onClose={handleClose}>
                <TransitionChild
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-hidden">
                  <div className="flex min-h-full justify-end">
                    <TransitionChild
                      as={Fragment}
                      enter="ease-out duration-300"
                      enterFrom="translate-x-full"
                      enterTo="translate-x-0"
                      leave="ease-in duration-200"
                      leaveFrom="translate-x-0"
                      leaveTo="translate-x-full"
                    >
                      <DialogPanel className="w-[85%] max-w-sm bg-forest/[0.98] backdrop-blur-xl flex flex-col min-h-full">
                        <NotificationsPanel
                          items={items}
                          isLoading={isLoading}
                          onClose={handleClose}
                        />
                      </DialogPanel>
                    </TransitionChild>
                  </div>
                </div>
              </Dialog>
            </Transition>
          </>
        )}
      </Tooltip>
    </>
  );
}
