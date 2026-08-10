'use client';

import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  excerptClamp,
  LabPlate,
  LabTitle,
  LISTING_PLATE,
  shortDate,
  type CardFamilyProps,
} from '../kit';

/**
 * 02 — Tonal Footer.
 *
 * Hypothesis: metadata stops competing with the title the moment it is standing
 * on different ground. The card keeps its white reading surface; the date and
 * the reading time drop into a sage-light band welded to the bottom edge, where
 * they can carry icons without adding noise to the text block.
 *
 * A tonal section, not a nested card: no radius of its own, no border, no
 * padding gap between it and the card's edge.
 */
export default function Option02TonalFooter({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-sage/40 bg-white',
        className
      )}
    >
      <div className={cn('flex-1', isListing ? 'flex gap-4 p-4' : 'flex flex-col')}>
        {/* Home and read-next run the plate to the card's own edge; the listing
            row keeps it inset, because a bled thumbnail in a landscape cell
            reads as a banner rather than as a picture of the post. */}
        <LabPlate
          post={post}
          sizes={isListing ? '128px' : '(max-width: 768px) 100vw, 340px'}
          radiusClassName={isListing ? 'rounded-lg' : 'rounded-none'}
          className={cn(
            isListing
              ? cn('aspect-[4/3]', LISTING_PLATE)
              : surface === 'home'
                ? 'aspect-[16/10] w-full'
                : 'aspect-[3/2] w-full'
          )}
        />

        <div className={cn('flex min-w-0 flex-1 flex-col', !isListing && 'p-4 pb-5')}>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70">
            {post.categoryLabel}
          </p>

          <h3 className="mt-2 text-forest">
            <LabTitle
              post={post}
              className={cn(
                surface === 'home'
                  ? 'text-[1.375rem] leading-[1.2]'
                  : isListing
                    ? 'text-[1.25rem] leading-[1.25]'
                    : 'text-[1.125rem] leading-snug'
              )}
            />
          </h3>

          <p
            className={cn(
              'mt-2 text-[0.8125rem] leading-relaxed text-forest/85',
              excerptClamp(surface)
            )}
          >
            {post.excerpt}
          </p>
        </div>
      </div>

      {/*
       * `sage-lite`, one step darker than `sage-light`. The lighter step is the
       * exact fill of the band the "Read next" section runs on, so a footer in
       * it dissolved the card's bottom edge into the page on that one surface
       * and nowhere else.
       */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-sage-lite px-4 py-2.5 text-[0.6875rem] text-forest/80">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-forest/70" strokeWidth={1.75} aria-hidden="true" />
          {shortDate(post.date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-forest/70" strokeWidth={1.75} aria-hidden="true" />
          {post.readingTime} min read
        </span>
        <span className="ml-auto truncate text-forest/80">{post.author}</span>
      </div>
    </article>
  );
}
