'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import UserAvatar from './UserAvatar';
import UpvoteButton from './UpvoteButton';
import type { Thread } from '@/types';

interface ThreadCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** Whether the current user has upvoted */
  hasUpvoted?: boolean;
  /** Whether the current user has bookmarked */
  isBookmarked?: boolean;
  /** Callback when upvote is toggled */
  onUpvote?: () => void;
  /** Callback when bookmark is toggled */
  onBookmark?: () => void;
  /** Show category badge */
  showCategory?: boolean;
}

/**
 * Card view for a discussion thread.
 * Reddit-inspired design with upvote, author info, and preview.
 * Default view for thread listings.
 * Entire card is clickable to navigate to thread detail.
 */
const ThreadCard = forwardRef<HTMLDivElement, ThreadCardProps>(
  ({
    thread,
    hasUpvoted = false,
    isBookmarked = false,
    onUpvote,
    onBookmark,
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

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });
    };

    // Stop event propagation for interactive elements
    const handleUpvoteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpvote?.();
    };

    const handleBookmarkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onBookmark?.();
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-white rounded-2xl border border-sage/30',
          // Dramatic hover animation - lift, scale, shadow, border glow
          'transition-all duration-300 ease-out',
          'hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(217,93,57,0.2)]',
          'hover:border-terracotta/50',
          // Pinned state
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        <Link
          href={`/discussion/thread/${thread.id}`}
          className="block"
        >
          <div className="flex">
            {/* Upvote Column */}
            <div className="flex-shrink-0 p-4 flex flex-col items-center">
              <UpvoteButton
                count={thread.upvotes}
                isUpvoted={hasUpvoted}
                onUpvote={handleUpvoteClick}
                direction="vertical"
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 py-4 pr-4 min-w-0">
              {/* Header: Category + Pin + Time */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {thread.isPinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta">
                    <Icon icon="lucide:pin" className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                {showCategory && (
                  <CategoryBadge category={thread.category} size="sm" />
                )}
                <span className="text-xs text-forest/50">
                  {formatRelativeTime(thread.createdAt)}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-lg font-medium text-forest leading-snug mb-2 group-hover:text-terracotta transition-colors">
                {thread.title}
              </h3>

              {/* Body Preview */}
              {thread.body && (
                <p className="text-sm text-forest/70 line-clamp-2 mb-3">
                  {thread.body}
                </p>
              )}

              {/* Image Thumbnails */}
              {thread.images && thread.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {thread.images.slice(0, 3).map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-sage-light"
                    >
                      <Image
                        src={img.thumbnail}
                        alt={img.alt || `Image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {thread.images!.length > 3 && idx === 2 && (
                        <div className="absolute inset-0 bg-forest/60 flex items-center justify-center">
                          <span className="text-bone text-sm font-semibold">
                            +{thread.images!.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Poll Indicator */}
              {thread.poll && (
                <div className="flex items-center gap-1.5 text-xs text-terracotta font-medium mb-3">
                  <Icon icon="lucide:bar-chart-2" className="w-4 h-4" />
                  <span>Poll: {thread.poll.question}</span>
                  {thread.poll.isClosed && (
                    <span className="text-forest/50">(Closed)</span>
                  )}
                </div>
              )}

              {/* Footer: Author + Stats */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-sage/20">
                <UserAvatar user={thread.author} size="sm" showBadges={false} />

                <div className="flex items-center gap-4 text-sm text-forest/50">
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:message-circle" className="w-4 h-4" />
                    <span>{thread.replyCount}</span>
                  </span>

                  {thread.bookmarkedBy.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Icon icon="lucide:bookmark" className="w-4 h-4" />
                      <span>{thread.bookmarkedBy.length}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
