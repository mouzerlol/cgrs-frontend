'use client';

import { Clock, User } from 'lucide-react';
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
 * 07 — Sage Inset.
 *
 * Hypothesis: three tones do the work that three type sizes were being asked to
 * do on their own. The title sits on the white reading surface, the excerpt
 * drops into a sage-light well as *quoted* rather than primary text, and the
 * record line sits on bone-light at the foot.
 *
 * The well is a tonal section, which is what the system says to promote inner
 * content to instead of nesting a card: no border, no radius fighting the
 * card's own, no shadow.
 */
export default function Option07SageInset({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-sage/40 bg-white',
        className
      )}
    >
      <div className={cn('flex-1 p-4', isListing && 'flex gap-4')}>
        <LabPlate
          post={post}
          sizes={isListing ? '132px' : '(max-width: 768px) 100vw, 340px'}
          className={cn(
            isListing
              ? cn('aspect-[4/3]', LISTING_PLATE, 'sm:w-[132px]')
              : surface === 'home'
                ? 'mb-4 aspect-[16/10] w-full'
                : 'mb-4 aspect-[3/2] w-full'
          )}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70">
            {post.categoryLabel}
          </p>

          <h3 className="mt-2 text-forest">
            <LabTitle
              post={post}
              className={cn(
                surface === 'home'
                  ? 'text-[1.4375rem] leading-[1.18]'
                  : isListing
                    ? 'text-[1.25rem] leading-[1.25]'
                    : 'text-[1.125rem] leading-snug'
              )}
            />
          </h3>

          {/* The clamp sits on the paragraph, not on the well. A clamped box
              that also carries padding shows a sliver of the line it cut. */}
          <div className="mt-3 rounded-lg bg-sage-light px-3 py-2.5">
            <p
              className={cn(
                'text-[0.8125rem] leading-relaxed text-forest/75',
                excerptClamp(surface)
              )}
            >
              {post.excerpt}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-bone-edge bg-bone-light px-4 py-2.5 text-[0.6875rem] text-forest/70">
        <span className="inline-flex items-center gap-1.5">
          <User className="h-3 w-3 text-forest/70" strokeWidth={1.75} aria-hidden="true" />
          <span className="truncate">{post.author}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-forest/70" strokeWidth={1.75} aria-hidden="true" />
          {post.readingTime} min
        </span>
        <span className="ml-auto uppercase tracking-[0.1em] text-forest/70">
          {shortDate(post.date)}
        </span>
      </div>
    </article>
  );
}
