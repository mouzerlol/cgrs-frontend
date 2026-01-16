'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import type { Thread } from '@/types';

interface ThreadCardCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** Whether the current user has upvoted */
  hasUpvoted?: boolean;
  /** Show category badge */
  showCategory?: boolean;
}

/**
 * Compact row view for a discussion thread.
 * Denser layout for power users who want to scan quickly.
 * Alternative to the default ThreadCard view.
 */
const ThreadCardCompact = forwardRef<HTMLDivElement, ThreadCardCompactProps>(
  ({
    thread,
    hasUpvoted = false,
    showCategory = true,
    className,
    ...props
  }, ref) => {
    // Format relative time
    const formatRelativeTime = (dateStr: string): string => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-4 py-3',
          'bg-white rounded-xl border border-sage/30',
          'transition-all duration-200',
          'hover:bg-sage-light hover:border-sage',
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        {/* Pinned Icon */}
        {thread.isPinned && (
          <Icon
            icon="lucide:pin"
            className="w-4 h-4 text-terracotta flex-shrink-0"
          />
        )}

        {/* Title (Link) */}
        <Link
          href={`/discussion/thread/${thread.id}`}
          className="flex-1 min-w-0 group"
        >
          <span className="text-sm font-medium text-forest truncate block group-hover:text-terracotta transition-colors">
            {thread.title}
          </span>
        </Link>

        {/* Category */}
        {showCategory && (
          <CategoryBadge
            category={thread.category}
            size="sm"
            showIcon={false}
            className="flex-shrink-0 hidden sm:inline-flex"
          />
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-forest/50 flex-shrink-0">
          {/* Upvotes */}
          <span
            className={cn(
              'flex items-center gap-1',
              hasUpvoted && 'text-terracotta'
            )}
          >
            <Icon icon="lucide:arrow-big-up" className="w-4 h-4" />
            <span className="tabular-nums">{thread.upvotes}</span>
          </span>

          {/* Replies */}
          <span className="flex items-center gap-1">
            <Icon icon="lucide:message-circle" className="w-4 h-4" />
            <span className="tabular-nums">{thread.replyCount}</span>
          </span>

          {/* Time */}
          <span className="tabular-nums min-w-[2rem] text-right">
            {formatRelativeTime(thread.createdAt)}
          </span>
        </div>
      </div>
    );
  }
);

ThreadCardCompact.displayName = 'ThreadCardCompact';

export default ThreadCardCompact;
