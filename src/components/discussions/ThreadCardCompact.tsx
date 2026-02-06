'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Thread, LatestReply } from '@/types';

interface ThreadCardCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** Latest reply info (if available) */
  latestReply?: LatestReply;
  /** Whether the current user has upvoted */
  hasUpvoted?: boolean;
  /** Whether the current user has bookmarked */
  isBookmarked?: boolean;
  /** Show category badge */
  showCategory?: boolean;
  /** Callback when upvote is clicked */
  onUpvote?: () => void;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when bookmark is toggled */
  onBookmark?: () => void;
  /** Callback when report is clicked */
  onReport?: () => void;
}

/**
 * Compact 2-row layout for a discussion thread.
 * Shows author info, title, engagement metrics, and latest reply.
 * Optimized for scanning thread lists quickly.
 */
const ThreadCardCompact = forwardRef<HTMLDivElement, ThreadCardCompactProps>(
  ({
    thread,
    latestReply,
    hasUpvoted = false,
    isBookmarked = false,
    showCategory = true,
    onUpvote,
    onShare,
    onBookmark,
    onReport,
    className,
    ...props
  }, ref) => {
    // Format relative time for display
    const formatRelativeTime = (dateStr: string): string => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
    };

    // Get first image thumbnail if available
    const thumbnail = thread.images && thread.images.length > 0
      ? thread.images[0].thumbnail
      : null;

    // Event handlers
    const handleUpvoteClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onUpvote?.();
    };

    const handleShareClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onShare?.();
    };

    const handleReportClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onReport?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-3 p-3',
          'bg-white rounded-xl border border-sage/30',
          'transition-all duration-200',
          'hover:bg-sage-light/50 hover:border-sage',
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        {/* Thumbnail (64x64) */}
        {thumbnail && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-sage-light self-stretch">
            <Image
              src={thumbnail}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* Row 1: Author info + posted time */}
          <div className="flex items-center gap-2">
            {/* Pinned Icon */}
            {thread.isPinned && (
              <Icon
                icon="lucide:pin"
                className="w-3.5 h-3.5 text-terracotta flex-shrink-0"
              />
            )}

            {/* Author Avatar (24px) */}
            <div className="relative w-6 h-6 rounded-full overflow-hidden bg-sage-light flex-shrink-0">
              {thread.author.avatar ? (
                <Image
                  src={thread.author.avatar}
                  alt={thread.author.displayName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-forest/50 text-xs font-medium">
                  {thread.author.displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Author Name */}
            <span className="text-xs font-medium text-forest truncate">
              {thread.author.displayName}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Posted Time */}
            <span className="text-xs text-forest/50 flex-shrink-0">
              Posted {formatRelativeTime(thread.createdAt)}
            </span>
          </div>

          {/* Row 2: Thread Title */}
          <Link
            href={`/discussion/thread/${thread.id}`}
            className="group"
          >
            <h3 className="text-sm font-medium text-forest line-clamp-1 group-hover:text-terracotta transition-colors">
              {thread.title}
            </h3>
          </Link>

          {/* Row 3: Actions */}
          <div className="flex items-center gap-2 mt-0.5">
            {/* Upvote Pill */}
            <button
              onClick={handleUpvoteClick}
              className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
                'transition-colors duration-200',
                hasUpvoted
                  ? 'bg-terracotta text-bone'
                  : 'bg-sage-light text-forest/70 hover:bg-sage'
              )}
              aria-label={hasUpvoted ? 'Remove upvote' : 'Upvote'}
            >
              <Icon icon="lucide:arrow-big-up" className="w-3.5 h-3.5" />
              <span className="tabular-nums">{thread.upvotes}</span>
            </button>

            {/* Comment Count */}
            <span className="inline-flex items-center gap-1 text-xs text-forest/60">
              <Icon icon="lucide:message-circle" className="w-3.5 h-3.5" />
              <span className="tabular-nums">{thread.replyCount}</span>
            </span>

            {/* Divider */}
            <span className="w-px h-4 bg-sage/50" />

            {/* Latest Reply (if available) */}
            {latestReply ? (
              <div className="flex items-center gap-1.5 text-xs text-forest/50">
                {/* Small Avatar (20px) */}
                <div className="relative w-5 h-5 rounded-full overflow-hidden bg-sage-light flex-shrink-0">
                  {latestReply.author.avatar ? (
                    <Image
                      src={latestReply.author.avatar}
                      alt={latestReply.author.displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-forest/50 text-[10px] font-medium">
                      {latestReply.author.displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline truncate max-w-[100px]">
                  {latestReply.author.displayName}
                </span>
                <span>replied {formatRelativeTime(latestReply.createdAt)}</span>
              </div>
            ) : (
              <span className="text-xs text-forest/40">No replies yet</span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Share Button */}
            <button
              onClick={handleShareClick}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                'hover:bg-sage/50 text-forest/40 hover:text-forest/70',
                'hidden sm:flex items-center justify-center'
              )}
              aria-label="Share"
            >
              <Icon icon="lucide:share-2" className="w-4 h-4" />
            </button>

            {/* Report Button */}
            <button
              onClick={handleReportClick}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                'hover:bg-sage/50 text-forest/40 hover:text-forest/70',
                'hidden sm:flex items-center justify-center'
              )}
              aria-label="Report"
            >
              <Icon icon="lucide:flag" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ThreadCardCompact.displayName = 'ThreadCardCompact';

export default ThreadCardCompact;
