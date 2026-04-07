'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { formatRelativeTimeShort } from '@/lib/format-relative-time';
import { cn } from '@/lib/utils';
import CategoryBadge from './CategoryBadge';
import UserAvatar from './UserAvatar';
import UpvoteButton from './UpvoteButton';
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
    previewUrl = null,
    previewLoading = false,
    imageAttachmentCount: imageAttachmentCountProp,
    hasUpvoted = false,
    isBookmarked = false,
    onUpvote,
    onBookmark,
    showCategory = true,
    className,
    ...props
  }, ref) => {
    const router = useRouter();

    const handleUpvoteClick = () => {
      onUpvote?.();
    };

    const handleBookmarkClick = () => {
      onBookmark?.();
    };

    const legacyImages = thread.images ?? [];
    const resolvedSrc =
      previewUrl ?? legacyImages[0]?.url ?? legacyImages[0]?.thumbnail ?? null;
    const imageCount =
      imageAttachmentCountProp !== undefined ? imageAttachmentCountProp : legacyImages.length;
    const legacyHasRenderableImage = Boolean(legacyImages[0]?.url || legacyImages[0]?.thumbnail);
    const showImage = resolvedSrc !== null;
    const showSkeleton = previewLoading && !showImage && imageCount > 0;
    const showPreviewSlot = showSkeleton || showImage || legacyHasRenderableImage;

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
          'relative flex h-full min-h-0 flex-col bg-white rounded-2xl border border-sage/30 overflow-hidden cursor-pointer group/card',
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
        <div className="flex min-h-0 flex-1 items-stretch">
          {/* Featured image or loading placeholder — stretch to full card height */}
          {showPreviewSlot && (
            <div className="relative min-h-[5.5rem] w-32 shrink-0 self-stretch bg-sage-light md:w-40">
              {showSkeleton && (
                <div className="absolute inset-0 animate-pulse bg-sage/40" aria-hidden />
              )}
              {showImage && (
                <>
                  <Image
                    src={resolvedSrc}
                    alt={legacyImages[0]?.alt || thread.title}
                    fill
                    className="object-cover"
                  />
                  {imageCount > 1 && (
                    <div className="absolute bottom-2 right-2 rounded-full bg-forest/80 px-2 py-0.5 text-xs text-bone">
                      +{imageCount - 1}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Upvote Column */}
          <div className="flex shrink-0 flex-col items-center self-stretch p-3 md:p-4">
            <UpvoteButton
              count={thread.upvotes}
              isUpvoted={hasUpvoted}
              onUpvote={handleUpvoteClick}
              direction="vertical"
            />
          </div>

          {/* Main Content — reserve 2-line title + 2-line excerpt so row heights match */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col py-3 pr-3 md:py-4 md:pr-4">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              {thread.isPinned && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta">
                  <Icon icon="lucide:pin" className="w-3 h-3" />
                  Pinned
                </span>
              )}
              {showCategory && <CategoryBadge category={thread.category} size="sm" />}
              <span className="text-xs text-forest/50">{formatRelativeTimeShort(thread.createdAt)}</span>
            </div>

            <h3 className="font-display mb-1.5 line-clamp-2 min-h-[2.75rem] text-base font-medium leading-snug text-forest transition-colors group-hover/card:text-terracotta md:min-h-[3.125rem] md:text-lg">
              {thread.title}
            </h3>

            <div className="mb-2 min-h-10 shrink-0">
              {thread.body ? (
                <p className="line-clamp-2 text-sm leading-normal text-forest/70">{thread.body}</p>
              ) : null}
            </div>

            {thread.poll && (
              <div className="mb-2">
                {thread.poll.isClosed ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sage-light/50 text-forest/60">
                    <Icon icon="lucide:lock" className="h-3.5 w-3.5" />
                    Closed
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sage-light/50 text-forest animate-poll-pulse">
                    <Icon icon="lucide:bar-chart-2" className="h-3.5 w-3.5" />
                    Poll
                  </span>
                )}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-sage/20 pt-2">
              <UserAvatar user={thread.author} size="sm" showBadges={false} />

              <div className="flex items-center gap-3 text-sm text-forest/50">
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:message-circle" className="h-4 w-4" />
                  <span>{thread.replyCount}</span>
                </span>

                {thread.bookmarkedBy.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:bookmark" className="h-4 w-4" />
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
