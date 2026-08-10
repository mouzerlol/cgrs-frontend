'use client';

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
 * 06 — Ledger.
 *
 * Hypothesis: the fastest way to make a title dominant is to make everything
 * else stop pretending to be prose. Category, date and duration become three
 * aligned key/value rows in fixed-width type on a bone-light block, so the eye
 * reads one serif line and then, only if it wants to, a small table.
 *
 * Mono is rare on the community side by design. This variant is the argument
 * for spending it here: these three values are exactly the fixed-width data the
 * Mono-as-Metadata Rule reserves it for.
 */
function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-10 shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.1em] text-forest/70">
        {label}
      </dt>
      <dd className="truncate font-mono text-[0.6875rem] tabular-nums text-forest/70">{value}</dd>
    </div>
  );
}

export default function Option06Ledger({ post, surface, className }: CardFamilyProps) {
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
          sizes={isListing ? '120px' : '(max-width: 768px) 100vw, 340px'}
          radiusClassName="rounded-lg"
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
                  ? 'text-[1.4375rem] leading-[1.18]'
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

      <dl className="space-y-1 border-t border-bone-edge bg-bone-light px-4 py-3">
        <LedgerRow label="Cat" value={post.categoryLabel} />
        <LedgerRow label="By" value={post.author} />
        <LedgerRow label="Pub" value={numericDate(post.date)} />
        <LedgerRow label="Read" value={`${post.readingTime} min`} />
      </dl>
    </article>
  );
}
