'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import type { Thread, LatestReply } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface ThreadCardCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** First image presigned URL (list preview) */
  previewUrl?: string | null;
  previewLoading?: boolean;
  /** Count of image/* opening-post attachments */
  imageAttachmentCount?: number;
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
    previewUrl = null,
    previewLoading = false,
    imageAttachmentCount: imageAttachmentCountProp,
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
    const router = useRouter();

    const legacyImages = thread.images ?? [];
    const thumbnail =
      previewUrl ??
      (legacyImages[0]?.thumbnail || legacyImages[0]?.url || null);
    const imageCount =
      imageAttachmentCountProp !== undefined ? imageAttachmentCountProp : legacyImages.length;
    const showThumbSkeleton = previewLoading && thumbnail === null && imageCount > 0;
    const showThumbSlot = Boolean(thumbnail) || showThumbSkeleton;

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

    const handleBookmarkClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onBookmark?.();
    };

    const handleReportClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onReport?.();
    };

    const handleCardClick = (e: React.MouseEvent) => {
      // Don't navigate if clicking on interactive elements that didn't stop propagation
      // (though our buttons do stop propagation)
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
          'flex gap-3 p-3 group/card cursor-pointer',
          'bg-white rounded-xl border border-sage',
          'transition-all duration-200 ease-out',
          'hover:bg-sage-light/50 hover:border-forest/30 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]',
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        {/* Thumbnail (64x64) */}
        {showThumbSlot && (
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-sage-light self-stretch">
            {showThumbSkeleton && (
              <div className="absolute inset-0 animate-pulse bg-sage/40" aria-hidden />
            )}
            {thumbnail && (
              <Image src={thumbnail} alt="" fill className="object-cover" />
            )}
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
              Posted {formatRelativeTimeShort(thread.createdAt)}
            </span>
          </div>

          {/* Row 2: Thread Title */}
          <h3 className="text-sm font-medium text-forest line-clamp-1 group-hover/card:text-terracotta transition-colors">
            {thread.title}
          </h3>

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

            {/* Reply count (authoritative); latest-reply line only when enriched (e.g. landing fetch). */}
            <span
              className="inline-flex items-center gap-1 text-xs text-forest/60"
              aria-label={`${thread.replyCount} ${thread.replyCount === 1 ? 'reply' : 'replies'}`}
            >
              <Icon icon="lucide:message-circle" className="w-3.5 h-3.5 shrink-0" aria-hidden />
              <span className="tabular-nums">{thread.replyCount}</span>
            </span>

            {latestReply && (
              <>
                <span className="w-px h-4 bg-sage/50 shrink-0" aria-hidden />
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-forest/50">
                  <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-sage-light">
                    {latestReply.author.avatar ? (
                      <Image
                        src={latestReply.author.avatar}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] font-medium text-forest/50">
                        {latestReply.author.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="hidden max-w-[100px] truncate sm:inline">{latestReply.author.displayName}</span>
                  <span className="truncate">replied {formatRelativeTimeShort(latestReply.createdAt)}</span>
                </div>
              </>
            )}

            {/* Poll Indicator */}
            {thread.poll && (
              <>
                <span className="w-px h-4 bg-sage/50 shrink-0" aria-hidden />
                {thread.poll.isClosed ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sage-light/50 text-forest/60">
                    <Icon icon="lucide:lock" className="h-3 w-3" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sage-light/50 text-forest animate-poll-pulse">
                    <Icon icon="lucide:bar-chart-2" className="h-3 w-3" />
                    Poll
                  </span>
                )}
              </>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bookmark Button */}
            <Tooltip content={isBookmarked ? 'Saved' : 'Save'}>
              <button
                onClick={handleBookmarkClick}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isBookmarked
                    ? 'bg-sage/60 text-forest'
                    : 'hover:bg-sage/50 text-forest/40 hover:text-forest/70',
                  'hidden sm:flex items-center justify-center'
                )}
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Icon
                  icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark'}
                  className="w-4 h-4"
                />
              </button>
            </Tooltip>

            {/* Share Button */}
            <Tooltip content="Share">
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
            </Tooltip>

            {/* Report Button */}
            <Tooltip content="Report">
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
            </Tooltip>
          </div>
        </div>
      </div>
    );
  }
);

ThreadCardCompact.displayName = 'ThreadCardCompact';

export default ThreadCardCompact;
