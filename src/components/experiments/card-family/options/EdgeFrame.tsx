'use client';

import { CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { excerptClamp, LabPlate, LabTitle, shortDate, type CardFamilyProps, type Surface } from '../kit';

/**
 * The frame the second round of options all share.
 *
 * Round one asked what a card is made of. This asks a narrower question, so the
 * structure is fixed and only tone and type move. Five options that differ in
 * layout are five designs; five that differ only in colour and scale are one
 * design being tuned, which is what these are.
 *
 * What is locked, and where each piece came from:
 *
 * - **Plate runs to the card's edges** (02 Tonal Footer). Portrait surfaces take
 *   it full width across the top; the listing row takes it as a band down the
 *   left, flush to three edges and as tall as the row.
 * - **Image left, text right on the listing row** (production `index`), because
 *   the landscape cell reads as an index line and that is the shape of one.
 * - **Reading time is a chip on the plate** (05 Plate Chip). It is the one value
 *   that is about the picture's own object rather than about the record.
 * - **Author sits at the left of a footer band**, quiet, fixed-width, tracked
 *   (09 Filed).
 * - **Date sits at the right of that band** with a calendar icon (05's slot, 02's
 *   icon), so the band reads who / when across one line.
 *
 * Everything a variant is allowed to change is in `EdgeTheme`.
 */

export interface EdgeTheme {
  /** Extra classes on the card surface itself. */
  card?: string;
  /** The reading-time chip pinned inside the plate. */
  chip: string;
  chipIcon: string;
  /** Category eyebrow: the whole class string, so weight and tracking move too. */
  category: string;
  /** Title scale per surface. Colour is inherited from the heading. */
  title: Record<Surface, string>;
  titleColour?: string;
  excerpt: string;
  /** The footer band's surface. */
  footer: string;
  author: string;
  date: string;
  dateIcon: string;
}

interface EdgeFrameProps extends CardFamilyProps {
  theme: EdgeTheme;
}

export default function EdgeFrame({ post, surface, theme, className }: EdgeFrameProps) {
  const isListing = surface === 'listing';

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-card border border-sage/40 bg-white',
        theme.card,
        className
      )}
    >
      <div className={cn('flex flex-1', isListing ? 'flex-row' : 'flex-col')}>
        <div
          className={cn(
            'relative shrink-0',
            isListing
              ? // Flush left, top and bottom, and as tall as the row. No aspect
                // ratio: the band's height is the text's, and the crop follows.
                'w-28 self-stretch sm:w-40'
              : surface === 'home'
                ? 'aspect-[16/10] w-full'
                : 'aspect-[3/2] w-full'
          )}
        >
          <LabPlate
            post={post}
            sizes={isListing ? '(max-width: 640px) 112px, 160px' : '(max-width: 768px) 100vw, 340px'}
            radiusClassName="rounded-none"
            className="absolute inset-0"
          />

          {/*
           * The chip carries a shadow at rest, which is the flat-at-rest rule's
           * own carve-out for an opaque paper surface sitting directly on a
           * photograph: there is nothing else to separate the two.
           */}
          <span
            className={cn(
              'pointer-events-none absolute bottom-2 z-[2] inline-flex items-center gap-1.5 rounded px-2 py-1 text-[0.6875rem] font-medium leading-none shadow-sheet',
              isListing ? 'left-2' : 'right-2',
              theme.chip
            )}
          >
            <Clock className={cn('h-3 w-3', theme.chipIcon)} strokeWidth={1.75} aria-hidden="true" />
            {post.readingTime} min
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <p className={theme.category}>{post.categoryLabel}</p>

          <h3 className={cn('mt-2', theme.titleColour ?? 'text-forest')}>
            <LabTitle post={post} className={theme.title[surface]} />
          </h3>

          <p className={cn('mt-2', theme.excerpt, excerptClamp(surface))}>{post.excerpt}</p>
        </div>
      </div>

      <div className={cn('flex items-center justify-between gap-3 px-4 py-2.5', theme.footer)}>
        <span className={cn('truncate', theme.author)}>{post.author}</span>
        <span className={cn('inline-flex shrink-0 items-center gap-1.5', theme.date)}>
          <CalendarDays className={cn('h-3.5 w-3.5', theme.dateIcon)} strokeWidth={1.75} aria-hidden="true" />
          {shortDate(post.date)}
        </span>
      </div>
    </article>
  );
}
