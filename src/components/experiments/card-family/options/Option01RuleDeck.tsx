'use client';

import { Clock } from 'lucide-react';
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
 * 01 — Rule Deck.
 *
 * Hypothesis: a card does not need containers to have a header and a footer.
 * Two hairlines in the card's own bone-edge divide it into three registers, and
 * everything else is scale. The header carries what the post *is*, the deck
 * carries what it *says*, the footer carries when and who.
 *
 * The rules run full bleed (`-mx-5`) so they read as the card's own divisions
 * rather than as underlines belonging to the text above them.
 */
export default function Option01RuleDeck({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  const titleSize =
    surface === 'home'
      ? 'text-[1.375rem] leading-[1.2]'
      : isListing
        ? 'text-[1.25rem] leading-[1.25]'
        : 'text-[1.125rem] leading-snug';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card border border-sage/40 bg-white p-5',
        className
      )}
    >
      {/* Header: what this is, and what it costs to read. */}
      <div className="flex items-baseline justify-between gap-3 pb-3">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70">
          {post.categoryLabel}
        </p>
        <p className="flex shrink-0 items-center gap-1.5 font-mono text-[0.6875rem] tabular-nums text-forest/70">
          <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
          {post.readingTime} min
        </p>
      </div>

      <div className={cn('-mx-5 border-t border-bone-edge px-5 pt-4', isListing && 'flex gap-4')}>
        <LabPlate
          post={post}
          sizes={isListing ? '112px' : '(max-width: 768px) 100vw, 340px'}
          className={cn(
            isListing ? cn('aspect-square', LISTING_PLATE) : 'mb-4 w-full',
            !isListing && (surface === 'home' ? 'aspect-[16/10]' : 'aspect-[3/2]')
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-forest">
            <LabTitle post={post} className={titleSize} />
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

      {/* Footer: the record of who filed it and when. */}
      <div className="-mx-5 mt-4 flex items-baseline justify-between gap-3 border-t border-bone-edge px-5 pt-3">
        <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-forest/70">
          {shortDate(post.date)}
        </p>
        <p className="truncate text-[0.6875rem] text-forest/70">{post.author}</p>
      </div>
    </article>
  );
}
