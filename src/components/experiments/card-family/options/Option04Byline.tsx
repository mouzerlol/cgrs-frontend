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
 * 04 — Byline.
 *
 * Hypothesis: the almanac's own furniture. A square of terracotta the size of a
 * full stop marks the section, the title takes all the weight, and everything
 * underneath is a byline set the way a newspaper sets one: author at reading
 * weight, the rest at half tone, divided by hairlines rather than by bullets.
 *
 * The terracotta dot is the whole colour budget. It is 6px, which is well
 * inside the One Voice Rule and does the job an eyebrow in terracotta used to
 * do at a size that could actually pass contrast.
 */
export default function Option04Byline({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex rounded-card border border-sage/40 bg-white p-5',
        isListing ? 'gap-5' : 'flex-col',
        className
      )}
    >
      <LabPlate
        post={post}
        sizes={isListing ? '140px' : '(max-width: 768px) 100vw, 340px'}
        className={cn(
          isListing
            ? cn('aspect-[4/3]', LISTING_PLATE, 'sm:w-[140px]')
            : surface === 'home'
              ? 'mb-4 aspect-[16/10] w-full'
              : 'mb-4 aspect-[3/2] w-full'
        )}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-forest/70">
          <span className="h-1.5 w-1.5 shrink-0 bg-terracotta" aria-hidden="true" />
          {post.categoryLabel}
        </p>

        <h3 className="mt-2.5 text-forest">
          <LabTitle
            post={post}
            className={cn(
              surface === 'home'
                ? 'text-[1.5rem] leading-[1.15] tracking-[-0.01em]'
                : isListing
                  ? 'text-[1.3125rem] leading-[1.2]'
                  : 'text-[1.1875rem] leading-snug'
            )}
          />
        </h3>

        <p
          className={cn(
            'mt-2.5 max-w-[52ch] text-[0.8125rem] leading-relaxed text-forest/85',
            excerptClamp(surface)
          )}
        >
          {post.excerpt}
        </p>

        {/* Byline. Divided by hairlines rather than dots: a rule is a piece of
            the same furniture the rest of the site is set with, a middot is a
            character borrowed from somewhere else. */}
        <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[0.75rem]">
          <span className="font-medium text-forest/85">{post.author}</span>
          <span className="h-3 w-px bg-bone-edge" aria-hidden="true" />
          <span className="text-forest/70">{shortDate(post.date)}</span>
          <span className="h-3 w-px bg-bone-edge" aria-hidden="true" />
          <span className="font-mono text-[0.6875rem] tabular-nums text-forest/70">
            {post.readingTime} min
          </span>
        </p>
      </div>
    </article>
  );
}
