'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { getDiscussionCategoryLabel, getDiscussionCategoryLucideIcon } from '@/lib/discussion-category-lucide-icons';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import UserAvatar from './UserAvatar';
import UpvoteButton from './UpvoteButton';
import { Tooltip } from '@/components/ui/Tooltip';
import type { Thread } from '@/types';

interface ThreadCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** First image presigned URL (list preview); server cover or client-fetched */
  previewUrl?: string | null;
  /** True while resolving presigned URL for attachments */
  previewLoading?: boolean;
  /** Number of image/* opening-post attachments (for +N badge); falls back to legacy thread.images */
  imageAttachmentCount?: number;
  /** Whether the current user has upvoted */
  hasUpvoted?: boolean;
  /** Whether the current user has bookmarked */
  isBookmarked?: boolean;
  /** Callback when upvote is toggled */
  onUpvote?: () => void;
  /** Callback when bookmark is toggled */
  onBookmark?: () => void;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when report is clicked */
  onReport?: () => void;
  /** Show category badge */
  showCategory?: boolean;
}

/**
 * Card view for a discussion thread.
 * Left column is always reserved (image, skeleton, or category icon) so text aligns across cards.
 * Author sits top-right; upvote and reply count bottom-left; actions bottom-right.
 */
const ThreadCard = forwardRef<HTMLDivElement, ThreadCardProps>(
  (
    {
      thread,
      previewUrl = null,
      previewLoading = false,
      imageAttachmentCount: imageAttachmentCountProp,
      hasUpvoted = false,
      isBookmarked = false,
      onUpvote,
      onBookmark,
      onShare,
      onReport,
      showCategory = true,
      className,
      ...props
    },
    ref,
  ) => {
    const router = useRouter();

    const handleUpvoteClick = () => {
      onUpvote?.();
    };

    const handleBookmarkClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onBookmark?.();
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

    const legacyImages = thread.images ?? [];
    const resolvedSrc =
      previewUrl ?? legacyImages[0]?.url ?? legacyImages[0]?.thumbnail ?? null;
    const imageCount =
      imageAttachmentCountProp !== undefined ? imageAttachmentCountProp : legacyImages.length;
    const showImage = resolvedSrc !== null;
    const showSkeleton = previewLoading && !showImage && imageCount > 0;
    const showCategoryPlaceholder = !showImage && !showSkeleton;
    const CategoryThumbIcon = getDiscussionCategoryLucideIcon(thread.category);

    const handleCardClick = (e: React.MouseEvent) => {
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
          'relative flex h-full min-h-0 flex-col cursor-pointer overflow-hidden rounded-2xl border border-sage bg-white group/card',
          'transition-colors, transition-transform, transition-opacity duration-200 ease-out',
          'hover:bg-sage-light/50 hover:border-forest/30 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]',
          thread.isPinned && 'border-l-4 border-l-terracotta',
          className
        )}
        {...props}
      >
        <div className="flex min-h-0 flex-1 items-stretch">
          {/* Left column: always same width so title/body align with or without a photo */}
          <div
            className="relative w-32 shrink-0 self-stretch min-h-[5.5rem] overflow-hidden bg-sage-light transition-colors duration-200 ease-out group-hover/card:bg-sage md:w-40"
            data-testid="thread-card-thumb-slot"
            aria-hidden={showImage || showSkeleton ? true : undefined}
            aria-label={
              showCategoryPlaceholder ? `Category: ${getDiscussionCategoryLabel(thread.category)}` : undefined
            }
          >
            {showSkeleton && <div className="absolute inset-0 animate-pulse bg-sage/40" aria-hidden />}
            {showImage && (
              <>
                <Image
                  src={resolvedSrc}
                  alt={legacyImages[0]?.alt || thread.title}
                  fill
                  sizes="(min-width: 768px) 160px, 128px"
                  className="object-cover object-center"
                />
                {imageCount > 1 && (
                  <div className="absolute bottom-2 right-2 rounded-full bg-forest/80 px-2 py-0.5 text-xs text-bone">
                    +{imageCount - 1}
                  </div>
                )}
              </>
            )}
            {showCategoryPlaceholder && (
              <div
                className="flex h-full min-h-[5.5rem] w-full items-center justify-center p-2"
                data-testid="thread-card-category-placeholder"
              >
                <CategoryThumbIcon className="h-14 w-14 shrink-0 text-white md:h-16 md:w-16" aria-hidden />
              </div>
            )}
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 md:px-4 md:py-4">
            <div className="mb-0 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-start gap-x-2 gap-y-1">
                {thread.isPinned && (
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-terracotta">
                    <Icon icon="lucide:pin" className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                <h3 className="font-display min-w-0 flex-1 text-base font-medium leading-snug text-forest line-clamp-2 transition-colors group-hover/card:text-terracotta md:text-lg">
                  {thread.title}
                </h3>
              </div>

              <UserAvatar
                user={thread.author}
                size="sm"
                avatarOnly
                showBadges={false}
                showTitle={false}
                className="shrink-0"
              />
            </div>

            <div className="mb-4 flex min-w-0 flex-wrap items-center gap-1.5">
              {showCategory && <CategoryBadge category={thread.category} size="xs" />}
              <span className="text-xs text-forest/50">{formatRelativeTimeShort(thread.createdAt)}</span>
            </div>

            <div className="mb-1.5 min-h-10 shrink-0">
              {thread.body ? (
                <p className="line-clamp-2 text-sm leading-normal text-forest/70">{thread.body}</p>
              ) : null}
            </div>

            {thread.poll && (
              <div className="mb-2">
                {thread.poll.isClosed ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-light/50 px-2.5 py-1 text-xs font-medium text-forest/60">
                    <Icon icon="lucide:lock" className="h-3.5 w-3.5" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex animate-poll-pulse items-center gap-1.5 rounded-full bg-sage-light/50 px-2.5 py-1 text-xs font-medium text-forest">
                    <Icon icon="lucide:bar-chart-2" className="h-3.5 w-3.5" />
                    Poll
                  </span>
                )}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sage/20 pt-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <UpvoteButton
                  count={thread.upvotes}
                  isUpvoted={hasUpvoted}
                  onUpvote={handleUpvoteClick}
                  direction="horizontal"
                  size="sm"
                />
                <span
                  className="inline-flex items-center gap-1 text-sm text-forest/50"
                  aria-label={`${thread.replyCount} ${thread.replyCount === 1 ? 'reply' : 'replies'}`}
                >
                  <Icon icon="lucide:message-circle" className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="tabular-nums">{thread.replyCount}</span>
                </span>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                <Tooltip content={isBookmarked ? 'Saved' : 'Save'}>
                  <button
                    type="button"
                    onClick={handleBookmarkClick}
                    className={cn(
                      'flex items-center justify-center rounded-lg p-1.5 transition-colors',
                      isBookmarked
                        ? 'bg-sage/60 text-forest'
                        : 'hover:bg-sage/50 text-forest/40 hover:text-forest/70',
                    )}
                    aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                  >
                    <Icon
                      icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark'}
                      className="h-4 w-4"
                    />
                  </button>
                </Tooltip>
                <Tooltip content="Share">
                  <button
                    type="button"
                    onClick={handleShareClick}
                    className="flex items-center justify-center rounded-lg p-1.5 text-forest/40 transition-colors hover:bg-sage/50 hover:text-forest/70"
                    aria-label="Share"
                  >
                    <Icon icon="lucide:share-2" className="h-4 w-4" />
                  </button>
                </Tooltip>
                <Tooltip content="Report">
                  <button
                    type="button"
                    onClick={handleReportClick}
                    className="flex items-center justify-center rounded-lg p-1.5 text-forest/40 transition-colors hover:bg-sage/50 hover:text-forest/70"
                    aria-label="Report"
                  >
                    <Icon icon="lucide:flag" className="h-4 w-4" />
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ThreadCard.displayName = 'ThreadCard';

export default ThreadCard;
