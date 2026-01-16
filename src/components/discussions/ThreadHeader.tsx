'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import UserAvatar from './UserAvatar';
import type { Thread } from '@/types';

interface ThreadHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** Show back navigation */
  showBackLink?: boolean;
}

/**
 * Thread header with title, author, category, and metadata.
 * Displayed at the top of the thread detail page.
 */
const ThreadHeader = forwardRef<HTMLDivElement, ThreadHeaderProps>(
  ({ thread, showBackLink = true, className, ...props }, ref) => {
    // Format date
    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-NZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    };

    // Format relative time
    const formatRelativeTime = (dateStr: string): string => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return formatDate(dateStr);
    };

    return (
      <div ref={ref} className={cn('space-y-4', className)} {...props}>
        {/* Back Link */}
        {showBackLink && (
          <Link
            href="/discussion"
            className="inline-flex items-center gap-2 text-sm text-forest/60 hover:text-forest transition-colors"
          >
            <Icon icon="lucide:arrow-left" className="w-4 h-4" />
            <span>Back to Discussions</span>
          </Link>
        )}

        {/* Meta Row: Category + Pin */}
        <div className="flex items-center gap-3 flex-wrap">
          {thread.isPinned && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-terracotta/10 text-terracotta text-sm font-semibold rounded-full">
              <Icon icon="lucide:pin" className="w-4 h-4" />
              Pinned
            </span>
          )}
          <CategoryBadge category={thread.category} size="md" />
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-forest leading-tight">
          {thread.title}
        </h1>

        {/* Author & Time Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
          <UserAvatar user={thread.author} size="md" />

          <div className="flex items-center gap-4 text-sm text-forest/50">
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:clock" className="w-4 h-4" />
              <time dateTime={thread.createdAt} title={formatDate(thread.createdAt)}>
                {formatRelativeTime(thread.createdAt)}
              </time>
            </span>

            {thread.updatedAt && thread.updatedAt !== thread.createdAt && (
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:pencil" className="w-4 h-4" />
                <span>Edited</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ThreadHeader.displayName = 'ThreadHeader';

export default ThreadHeader;
