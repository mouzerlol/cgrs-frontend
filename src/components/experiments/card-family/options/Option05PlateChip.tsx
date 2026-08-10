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
 * 05 — Plate Chip.
 *
 * Hypothesis: the text block reads fastest when it contains nothing but text.
 * Both pieces of metadata move onto the picture as opaque paper chips, the way
 * the blog's category filters are pinned to its hero, leaving the body as
 * category, title, excerpt and nothing else.
 *
 * Opaque, always. A chip that borrows its background from the photograph behind
 * it has no contrast on the frame where it matters.
 */
function Chip({
  children,
  tone = 'bone',
  className,
}: {
  children: React.ReactNode;
  tone?: 'bone' | 'forest';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-1 text-[0.6875rem] font-medium leading-none shadow-sheet',
        tone === 'bone' ? 'bg-bone text-forest/75' : 'bg-forest text-bone/85',
        className
      )}
    >
      {children}
    </span>
  );
}

export default function Option05PlateChip({ post, surface, className }: CardFamilyProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex rounded-card border border-sage/40 bg-white p-4',
        isListing ? 'gap-4' : 'flex-col',
        className
      )}
    >
      <LabPlate
        post={post}
        sizes={isListing ? '168px' : '(max-width: 768px) 100vw, 340px'}
        className={cn(
          isListing
            ? cn('aspect-[3/2]', LISTING_PLATE, 'sm:w-[168px]')
            : surface === 'home'
              ? 'mb-4 aspect-[16/10] w-full'
              : 'mb-4 aspect-[3/2] w-full'
        )}
      >
        {/* The listing thumbnail is too small to hold two chips without
            covering the picture, so it keeps the date and drops the duration
            into the text column. */}
        <span className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap items-end gap-1.5">
          <Chip>{shortDate(post.date)}</Chip>
          {!isListing && (
            <Chip tone="forest" className="ml-auto">
              <Clock className="h-3 w-3" strokeWidth={1.75} aria-hidden="true" />
              {post.readingTime} min
            </Chip>
          )}
        </span>
      </LabPlate>

      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-forest/70">
          {post.categoryLabel}
          {isListing && (
            <>
              <span className="h-3 w-px bg-bone-edge" aria-hidden="true" />
              <span className="font-mono text-[0.6875rem] font-medium normal-case tracking-normal text-forest/70">
                {post.readingTime} min
              </span>
            </>
          )}
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
    </article>
  );
}
