'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import UserAvatar from './UserAvatar';
import {
  getDiscussionCategoryLucideIcon,
  getDiscussionCategoryLabel,
} from '@/lib/discussion-category-lucide-icons';
import type { Thread } from '@/types';

interface ThreadHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Thread data */
  thread: Thread;
  /** Show back navigation */
  showBackLink?: boolean;
  /**
   * Controls that act on the thread as a document (bookmark, share) rather than
   * on the conversation (vote, reply). They sit under the badges, top-right, so
   * the footer toolbar is left holding only conversation actions.
   */
  documentActions?: React.ReactNode;
}

/**
 * Thread header with title, author, category, and metadata.
 * Displayed at the top of the thread detail page.
 */
const ThreadHeader = forwardRef<HTMLDivElement, ThreadHeaderProps>(
  ({ thread, showBackLink = true, documentActions, className, ...props }, ref) => {
    const CategoryIcon = getDiscussionCategoryLucideIcon(thread.category);
    const categoryLabel = getDiscussionCategoryLabel(thread.category);

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

        {/* Title row. The category leads as an icon plate over a terracotta micro-label —
            the Column Plate convention from AccountSectionHeading — rather than a badge
            competing for the top-right corner with the pin and the controls.

            Below sm the layout splits in two: a header strip (category, pin, bookmark,
            share) on its own row, then the heading full width beneath. Three side-by-side
            columns on a 375px screen leave the title a column too narrow to read. */}
        <div
          data-testid="thread-header-top"
          className="flex flex-wrap items-start gap-x-3 gap-y-3 sm:flex-nowrap sm:items-stretch sm:gap-x-0"
        >
          {/* Category plate. From sm it becomes the card's left gutter column, carrying
              the rule on its right edge — so the rule exists only alongside the title,
              which is the one place it divides anything.

              8rem, not the 6rem it was. The label is a single unbreakable word in the
              longest cases — ANNOUNCEMENTS measures ~102px at this size and tracking,
              INTRODUCTIONS ~93px — and 6rem less the 1.25rem gutter left a 75px box.
              The word overflowed it, spending the padding and running onto the rule, so
              the divider read as touching the text. 8rem less the same gutter is a 108px
              box: the longest word fits and the 1.25rem of air before the rule is air
              again rather than something the label has already crossed. */}
          <div
            data-testid="thread-category"
            className={cn(
              'order-1 flex shrink-0 items-center gap-2.5',
              'sm:w-32 sm:flex-col sm:justify-start sm:gap-1.5 sm:border-r sm:border-sage/40 sm:pr-5',
            )}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-forest/[0.07] text-forest sm:h-11 sm:w-11 md:h-12 md:w-12"
              aria-hidden="true"
            >
              <CategoryIcon className="h-5 w-5 md:h-6 md:w-6" strokeWidth={1.5} />
            </span>
            {/* `break-words` is the backstop, not the mechanism: the column is sized to
                hold today's labels whole, and a longer one added later wraps inside the
                column instead of crossing the rule again. */}
            <span className="max-w-full break-words text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.16em] text-terracotta sm:text-center">
              {categoryLabel}
            </span>
          </div>

          {/* Mobile: closes the header strip beside the category. Desktop: top-right. */}
          <div
            data-testid="thread-header-controls"
            className="order-2 ml-auto flex shrink-0 items-center gap-1.5 sm:order-3 sm:flex-col sm:items-end sm:gap-2"
          >
            {thread.isPinned && (
              /* Icon-only below sm. The word costs ~55px, which is the difference
                 between this strip fitting on one row at 375px and wrapping. */
              <span
                title="Pinned"
                className="inline-flex items-center gap-1 rounded-full bg-terracotta/10 px-2 py-1 text-xs font-semibold text-terracotta sm:gap-1.5 sm:px-3 sm:text-sm"
              >
                <Icon icon="lucide:pin" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="sr-only sm:not-sr-only">Pinned</span>
              </span>
            )}

            {documentActions && (
              <div className="flex items-center gap-1.5">{documentActions}</div>
            )}
          </div>

          {/* Full width on its own line below sm; the middle column from sm up.
              min-h matches the emblem, and self-start keeps it from stretching to the
              row, so a short title sits optically centred on the emblem rather than
              hanging off its top edge. A taller title simply grows downward. */}
          <h1 className="order-3 min-w-0 basis-full font-display text-xl font-semibold leading-tight text-forest sm:order-2 sm:flex sm:min-h-[2.75rem] sm:basis-0 sm:flex-1 sm:items-center sm:self-start sm:pl-5 sm:text-2xl md:min-h-[3rem] md:text-3xl">
            {thread.title}
          </h1>
        </div>

        {/* Author & Time Row — side by side at every width. The avatar and metadata step
            down a size on mobile so the two fit on one line instead of stacking. From sm
            it takes the gutter indent so it lines up with the title above it. */}
        <div
          data-testid="thread-header-byline"
          className="flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2 sm:gap-x-4 sm:pl-[calc(8rem_+_1.25rem)]"
        >
          <UserAvatar
            user={thread.author}
            size="sm"
            className="[&_span]:text-[0.8125rem] sm:[&_span]:text-sm"
          />

          <div className="flex items-center gap-3 text-xs text-forest/50 sm:gap-4 sm:text-sm">
            <span className="flex items-center gap-1.5">
              <Icon icon="lucide:clock" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <time dateTime={thread.createdAt} title={formatDate(thread.createdAt)}>
                {formatRelativeTime(thread.createdAt)}
              </time>
            </span>

            {thread.isEdited && (
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:pencil" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
