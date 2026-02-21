'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
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
 * Shows featured image on left side when available.
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
    const router = useRouter();

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

    const handleUpvoteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onUpvote?.();
    };

    const handleBookmarkClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onBookmark?.();
    };

    // Check if thread has images for the left-side layout
    const hasImages = thread.images && thread.images.length > 0;
    const featuredImage = hasImages ? thread.images![0] : null;

    const handleCardClick = (e: React.MouseEvent) => {
      // Navigate to thread detail on card click
      router.push(`/discussion/thread/${thread.id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        router.push(`/discussion/thread/${thread.id}`);
      }
    };

    return (
      <div
        ref={ref}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        className={cn(
          'relative bg-white rounded-2xl border border-sage/30 overflow-hidden cursor-pointer group/card',
          // Dramatic hover animation - lift, scale, shadow, border glow
          'transition-all duration-300 ease-out',
          'hover:-translate-y-2 hover:shadow-[0_16px_32px_rgba(217,93,57,0.15)]',
          'hover:border-terracotta/40',
          // Pinned state
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        <div className="flex">
          {/* Featured Image (Left Side) - Only shown when images exist */}
            {hasImages && featuredImage && (
              <div className="relative w-32 md:w-40 flex-shrink-0 bg-sage-light">
                <Image
                  src={featuredImage.url || featuredImage.thumbnail}
                  alt={featuredImage.alt || thread.title}
                  fill
                  className="object-cover"
                />
                {/* Image count badge if multiple images */}
                {thread.images!.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-forest/80 text-bone text-xs px-2 py-0.5 rounded-full">
                    +{thread.images!.length - 1}
                  </div>
                )}
              </div>
            )}

            {/* Upvote Column */}
            <div className="flex-shrink-0 p-3 md:p-4 flex flex-col items-center">
              <UpvoteButton
                count={thread.upvotes}
                isUpvoted={hasUpvoted}
                onUpvote={handleUpvoteClick}
                direction="vertical"
              />
            </div>

            {/* Main Content */}
            <div className="flex-1 py-3 md:py-4 pr-3 md:pr-4 min-w-0">
              {/* Header: Category + Pin + Time */}
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
              <h3 className="font-display text-base md:text-lg font-medium text-forest leading-snug mb-1.5 group-hover/card:text-terracotta transition-colors line-clamp-2">
                {thread.title}
              </h3>

              {/* Body Preview */}
              {thread.body && (
                <p className="text-sm text-forest/70 line-clamp-2 mb-2">
                  {thread.body}
                </p>
              )}

              {/* Poll Indicator */}
              {thread.poll && (
                <div className="flex items-center gap-1.5 text-xs text-terracotta font-medium mb-2">
                  <Icon icon="lucide:bar-chart-2" className="w-4 h-4" />
                  <span>Poll: {thread.poll.question}</span>
                  {thread.poll.isClosed && (
                    <span className="text-forest/50">(Closed)</span>
                  )}
                </div>
              )}

              {/* Footer: Author + Stats */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-sage/20">
                <UserAvatar user={thread.author} size="sm" showBadges={false} />

                <div className="flex items-center gap-3 text-sm text-forest/50">
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
      </div>
    );
  }
);

ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
