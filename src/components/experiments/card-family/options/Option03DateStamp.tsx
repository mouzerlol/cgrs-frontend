'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  excerptClamp,
  LabPlate,
  LabTitle,
  LISTING_PLATE,
  stampParts,
  type CardFamilyProps,
} from '../kit';

/**
 * 03 — Date Stamp.
 *
 * Hypothesis: on a noticeboard, *when* is the second question after *what*, and
 * a numeral answers it faster than a sentence does. The date is set as a
 * printed stamp — day at title scale, month tracked beneath — the way
 * `CalendarCard` sets an event date, so a post and an event read as filed by
 * the same hand.
 *
 * Sage-lite rather than the event badge's terracotta: a date is not an action,
 * and three terracotta blocks in a row of cards would spend the One Voice Rule
 * on the least important thing on the card.
 */
function Stamp({ date, className }: { date: string; className?: string }) {
  const { day, month } = stampParts(date);

  return (
    <div
      className={cn(
        'flex w-12 shrink-0 self-start flex-col items-center rounded-lg bg-sage-lite px-1.5 py-1.5 text-forest',
        className
      )}
    >
      <span className="font-display text-[1.375rem] font-medium leading-none tabular-nums">
        {day}
      </span>
      <span className="mt-1 text-[0.625rem] font-semibold uppercase leading-none tracking-[0.14em] text-forest/70">
        {month}
      </span>
    </div>
  );
}

export default function Option03DateStamp({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card border border-sage/40 bg-white p-4',
        className
      )}
    >
      <div className={cn(isListing && 'flex gap-4')}>
        <div className={cn('relative', isListing ? 'shrink-0 self-start' : 'mb-4')}>
          <LabPlate
            post={post}
            sizes={isListing ? '128px' : '(max-width: 768px) 100vw, 340px'}
            className={cn(
              isListing
                ? cn('aspect-square', LISTING_PLATE)
                : surface === 'home'
                  ? 'aspect-[16/10] w-full'
                  : 'aspect-[3/2] w-full'
            )}
          />

          {/* Pinned to the plate on the portrait surfaces, where there is room
              for it to sit on the picture without covering the subject. Opaque,
              because a translucent chip hands its contrast to whatever frame it
              lands on. */}
          {!isListing && <Stamp date={post.date} className="absolute bottom-2 left-2 shadow-sheet" />}
        </div>

        {/* Everything in the text column shares one left edge, including the
            excerpt and the record line. The stamp indents the whole column, not
            just the title, or the cell reads as two ragged margins. */}
        <div className={cn('flex min-w-0 flex-1', isListing ? 'gap-3' : 'flex-col')}>
          {isListing && <Stamp date={post.date} />}

          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70">
              {post.categoryLabel}
            </p>

            <h3 className="mt-1.5 text-forest">
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
                'mt-2.5 text-[0.8125rem] leading-relaxed text-forest/85',
                excerptClamp(surface)
              )}
            >
              {post.excerpt}
            </p>

            <p className="mt-3 flex items-center gap-1.5 text-[0.6875rem] text-forest/70">
              <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              {post.readingTime} min
              <span aria-hidden="true" className="text-forest/25">
                /
              </span>
              <span className="truncate">{post.author}</span>
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
