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
 * 10 — Red Letter. **Stretch: spends the One Voice Rule on the card header.**
 *
 * Hypothesis: terracotta earns more than an eyebrow. A solid band across the
 * head of the card carries the category and the date, and the rest of the card
 * needs no accent at all, so a grid of these still has exactly one voice per
 * cell.
 *
 * The rule it tests is the 10%-of-screen budget: three of these in a home-page
 * row is roughly 6% of the viewport in terracotta, which is inside the letter
 * of the rule and arguably outside its spirit. Worth seeing rather than
 * arguing about.
 *
 * Type on the band is **forest, not bone**. Bone on terracotta measures about
 * 3.3:1 and does not reach AA at label size; forest on terracotta clears 4.5:1,
 * so the band's hierarchy is carried by weight and tracking instead of tone.
 */
export default function Option10RedLetter({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-sage/40 bg-white',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 bg-terracotta px-4 py-2 text-forest">
        <p className="truncate text-[0.6875rem] font-bold uppercase tracking-[0.18em]">
          {post.categoryLabel}
        </p>
        <p className="shrink-0 text-[0.6875rem] font-medium tabular-nums">{shortDate(post.date)}</p>
      </div>

      <div className={cn('flex-1 p-4', isListing && 'flex gap-4')}>
        <LabPlate
          post={post}
          sizes={isListing ? '128px' : '(max-width: 768px) 100vw, 340px'}
          className={cn(
            isListing
              ? cn('aspect-[4/3]', LISTING_PLATE)
              : surface === 'home'
                ? 'mb-4 aspect-[16/10] w-full'
                : 'mb-4 aspect-[3/2] w-full'
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="text-forest">
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

          <p className="mt-3 flex items-baseline gap-2 text-[0.6875rem] text-forest/70">
            <span className="truncate">{post.author}</span>
            <span aria-hidden="true" className="text-forest/20">
              /
            </span>
            <span className="shrink-0 tabular-nums">{post.readingTime} min</span>
          </p>
        </div>
      </div>
    </article>
  );
}
