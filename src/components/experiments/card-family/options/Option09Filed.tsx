'use client';

import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  excerptClamp,
  LabPlate,
  LabTitle,
  LISTING_PLATE,
  numericDate,
  type CardFamilyProps,
} from '../kit';

/**
 * 09 — Filed. **Stretch: breaks the Dual Radius Doctrine on purpose.**
 *
 * Hypothesis: the management identity's square, filed-record shape is the more
 * honest one for a committee blog, which is a record of what the society said
 * and when. Every structural radius collapses to none, the category moves into
 * a solid forest header bar, and the footer runs in mono on bone-light.
 *
 * The compensating polish the square identity requires is here too: crisp
 * hairlines rather than a soft border, and a tight shadow on hover instead of
 * the community side's `-translate-y` lift.
 *
 * If this wins, it is a decision to move the blog across the identity line, not
 * a tweak. That is why it is labelled.
 */
export default function Option09Filed({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-none border border-sage/25 bg-white',
        'transition-shadow duration-200 ease-out-custom hover:border-forest/30 hover:shadow-[0_8px_22px_rgba(26,34,24,0.08)]',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 bg-forest px-3 py-2">
        <p className="truncate text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-bone/85">
          {post.categoryLabel}
        </p>
        <p className="shrink-0 font-mono text-[0.625rem] tabular-nums text-bone/55">
          {numericDate(post.date)}
        </p>
      </div>

      <div className={cn('flex-1 p-4', isListing && 'flex gap-4')}>
        <LabPlate
          post={post}
          sizes={isListing ? '120px' : '(max-width: 768px) 100vw, 340px'}
          radiusClassName="rounded-none"
          className={cn(
            isListing
              ? cn('aspect-square', LISTING_PLATE, 'sm:w-[120px]')
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
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-sage/25 bg-bone-light px-4 py-2 font-mono text-[0.625rem] uppercase tracking-[0.08em] text-forest/70">
        <span className="truncate">{post.author}</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums">
          <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
          {post.readingTime} min
        </span>
      </div>
    </article>
  );
}
