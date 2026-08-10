'use client';

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
 * 08 — Ascender.
 *
 * Hypothesis: the strongest hierarchy available is the one we are not using.
 * The title runs at nearly three times the size of anything else on the card
 * and is given the space to be looked at; category, date, author and duration
 * all collapse to a single 10px tracked line that sits under a rule as short as
 * itself, right-aligned, so it reads as a mark on the page rather than as a row
 * of content.
 *
 * Deliberately sparse. Its risk is that a card with this much air costs more
 * vertical space than a listing can afford, which is exactly what looking at it
 * three ways is meant to settle.
 */
export default function Option08Ascender({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex rounded-card border border-sage/40 bg-white p-5',
        isListing ? 'gap-6' : 'flex-col',
        className
      )}
    >
      <LabPlate
        post={post}
        sizes={isListing ? '148px' : '(max-width: 768px) 100vw, 340px'}
        className={cn(
          isListing
            ? cn('aspect-square', LISTING_PLATE, 'sm:w-[148px]')
            : surface === 'home'
              ? 'aspect-[16/10] w-full'
              : 'aspect-[3/2] w-full'
        )}
      />

      <div className={cn('flex min-w-0 flex-1 flex-col', !isListing && 'pt-6')}>
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-forest/70">
          {post.categoryLabel}
        </p>

        <h3 className="mt-3 text-forest">
          <LabTitle
            post={post}
            className={cn(
              'tracking-[-0.015em]',
              surface === 'home'
                ? 'text-[1.75rem] leading-[1.12]'
                : isListing
                  ? 'text-[1.5rem] leading-[1.15]'
                  : 'text-[1.375rem] leading-[1.18]'
            )}
          />
        </h3>

        <p
          className={cn(
            'mt-3 max-w-[46ch] text-[0.8125rem] leading-relaxed text-forest/85',
            excerptClamp(surface)
          )}
        >
          {post.excerpt}
        </p>

        {/* The rule is as wide as the line beneath it and no wider: a full-width
            hairline here would read as a second card division and undo the
            emptiness the whole variant is buying.

            Set as a wrapping flex row rather than one run of text, so a narrow
            cell drops a whole field to the next line instead of orphaning the
            word "min" under a dangling slash. */}
        <div className="mt-auto flex flex-col items-end pt-8">
          <span className="h-px w-full max-w-[13rem] bg-bone-edge" aria-hidden="true" />
          <p className="mt-2 flex flex-wrap items-baseline justify-end gap-x-3 gap-y-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-forest/70">
            {/* Two groups, and the break can only fall between them. A slash
                between the groups would be left dangling at the end of the
                first line the moment the cell is too narrow to hold both. */}
            <span className="whitespace-nowrap">
              {shortDate(post.date)}
              <span className="mx-1.5 text-forest/20" aria-hidden="true">
                /
              </span>
              {post.author}
            </span>
            <span className="whitespace-nowrap tabular-nums">{post.readingTime} min</span>
          </p>
        </div>
      </div>
    </article>
  );
}
