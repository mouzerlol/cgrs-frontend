import Link from 'next/link';
import { CalendarDays, Clock, Lock } from 'lucide-react';
import type { PostSummary } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';
import { cn, formatDateShort } from '@/lib/utils';
import BlogPlate from './BlogPlate';

/**
 * The one card a post is listed in, wherever it is listed.
 *
 * There used to be three of these. The home page had its own component with no
 * border, no category and no reading time, dating the post in terracotta at the
 * top; the listing and the article's "Read next" band shared a second component
 * that dated it in terracotta at the bottom and set its title two sizes
 * smaller. Three surfaces showing the same kind of object disagreed about what
 * the object was made of.
 *
 * They are one vocabulary now, arranged four ways. The variants below change
 * where the pieces sit and how big the title is; they do not change what a
 * piece means or how far it has faded. Picked from the fifteen tested in
 * `/design-experiments` → Card Family.
 *
 * **The vocabulary**
 *
 * - **The plate runs to the card's own edges.** Portrait cells take it full
 *   width across the top, the listing row takes it as a band down the left. No
 *   inset, no second radius: the card's corners do the rounding.
 * - **Reading time is a chip on the plate.** It is the one value that describes
 *   the object rather than the record, and putting it on the picture leaves the
 *   text block holding nothing but text.
 * - **Who and when go at the foot of the card**, in one of two arrangements.
 *   The portrait cells put them on a band across the bottom, author left and
 *   date right, drawn by a hairline with no fill so it separates without adding
 *   a second surface. The landscape cells cannot: their picture is a column the
 *   full height of the card, and a band under it would cut the picture short to
 *   pay for a strip that is mostly empty. There the two values run as one line
 *   at the foot of the text column instead. Same pieces, same tone, arranged
 *   for the shape.
 * - **One accent, spent on the smallest mark.** The category is the only
 *   coloured thing on the card. Nothing else competes with it, which is the
 *   only reason a coloured label can appear on every cell of a row without
 *   breaking the One Voice Rule.
 * - **`terracotta-dark`, not `terracotta`.** The brand red measures about 3.5:1
 *   on white and does not reach AA at 11px. Its hover companion clears 4.5:1
 *   and is close enough in hue that the two read as the same colour. This is
 *   the same problem DESIGN.md's Repeated-Eyebrow Exception works around by
 *   dropping per-item eyebrows to `forest/70`; a darker red keeps the colour
 *   instead of giving it up.
 *
 * **The tone floor.** Recessive text stops at `forest/70`, which measures 5.3:1
 * on white. The greys that look right for "faded" are AA failures at label
 * size: `forest/60` is 3.9:1 and `forest/45` is 2.6:1. Three steps, and nothing
 * between them: `text-forest` for titles, `text-forest/85` for excerpts,
 * `text-forest/70` for the record. Further recession comes from size, weight
 * and tracking.
 *
 * Every variant needs a `<DuotoneFilter />` mounted on the same page.
 *
 * Shipped from `/design-experiments` → Card Family, option 13 Red Eyebrow.
 */
export type CellVariant = 'lead' | 'index' | 'tail' | 'home';

/**
 * The cell surface. A full-strength sage hairline, the same border the
 * discussion's thread cards carry — the two lists sit one click apart in the
 * same nav, and a card that states its edge differently reads as a different
 * kind of object. It replaces the old half-strength rule, which was pitched for
 * cards sitting straight on bone paper; the listing now groups them on a sage
 * tint, where an under-strength edge simply disappears.
 *
 * The cell itself never moves on hover: that is carried by the title's drawn
 * rule and the plate returning to full colour.
 *
 * `overflow-hidden` is structural here rather than cosmetic. The plate and the
 * footer band both run to the card's edges, and the card's radius is the only
 * thing shaping them.
 */
export const BLOG_CARD_SURFACE =
  'overflow-hidden rounded-card border border-sage bg-white';

interface BlogPostCellProps {
  post: PostSummary;
  variant: CellVariant;
  /** Set false to run the cell as text only, even when the post has a hero. */
  withPlate?: boolean;
  className?: string;
}

/**
 * Category, and the card's whole colour budget. See the note on
 * `terracotta-dark` above: the brand red does not reach AA at this size.
 */
function CategoryEyebrow({ label, gated }: { label: string; gated?: boolean }) {
  if (!label && !gated) return null;
  return (
    <p className="flex flex-wrap items-center gap-2 font-body text-[0.6875rem] font-bold uppercase tracking-[0.18em] text-terracotta-dark">
      {label}
      {gated && <OwnersOnlyMark />}
    </p>
  );
}

/**
 * Says a post is gated, wherever a member is shown one.
 *
 * Words rather than a lone padlock. The mark is not decoration: this post's URL
 * returns a plain 404 to anyone who does not hold an ownership role, with no
 * sign-in prompt and nothing naming what is behind it. A member who sends the
 * link to a tenant has no other way of knowing it will arrive broken, so the
 * card has to say so — and a glyph on its own would need the words in an
 * aria-label anyway.
 */
export function OwnersOnlyMark({ className }: { className?: string }) {
  return (
    <span
      data-testid="owners-only"
      className={cn(
        'inline-flex items-center gap-1 rounded bg-forest-light px-1.5 py-0.5',
        'text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-bone',
        className
      )}
    >
      <Lock className="h-2.5 w-2.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
      Owners only
    </span>
  );
}

/**
 * Reading time, pinned inside the plate as an opaque paper chip.
 *
 * Opaque, always: a chip that borrows its background from the photograph behind
 * it has no contrast at all on the wrong frame. The shadow at rest is the
 * flat-at-rest rule's own carve-out for paper sitting directly on a picture,
 * where nothing else separates the two.
 */
function ReadingTimeChip({ minutes, className }: { minutes: number; className?: string }) {
  return (
    <span
      className={cn(
        'pointer-events-none absolute bottom-3 z-[2] inline-flex items-center gap-1.5 rounded bg-forest px-2 py-1 text-[0.6875rem] font-medium leading-none text-bone/85 shadow-sheet',
        className
      )}
    >
      <Clock className="h-3 w-3 text-bone/60" strokeWidth={1.75} aria-hidden="true" />
      {minutes} min
    </span>
  );
}

/**
 * Author and date, on a band welded to the card's bottom edge.
 *
 * No fill: the band is a hairline and a change of type, not a second surface.
 * A tinted strip here would be the third tone on a card whose one accent is
 * already spoken for, and the eyebrow needs the room.
 *
 * The glyphs sit at `forest/55`, which clears the 3:1 non-text bar. They are
 * decorative — the date and the duration are both spelled out beside them — but
 * a mark too faint to resolve is not quiet, it is broken.
 *
 * `withReadingTime` is for the cells that run without a plate. Reading time
 * normally lives on the picture, so a post with no hero would otherwise be the
 * one card in the list that does not say how long it is; the band takes it back
 * rather than letting the value vanish with the image.
 */
function RecordBand({
  post,
  withReadingTime = false,
}: {
  post: PostSummary;
  withReadingTime?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-bone-edge px-4 py-2.5 text-[0.6875rem] text-forest/70">
      <span className="truncate font-mono text-[0.625rem] uppercase tracking-[0.08em]">
        {post.author}
      </span>

      <span className="inline-flex shrink-0 items-center gap-3">
        {withReadingTime && (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-forest/55" strokeWidth={1.75} aria-hidden="true" />
            {post.readingTime} min
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays
            className="h-3.5 w-3.5 text-forest/55"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          {formatDateShort(post.date)}
        </span>
      </span>
    </div>
  );
}

/**
 * The same record as `RecordBand`, set as a line rather than as a band, for the
 * landscape cells whose picture runs the full height of the card.
 *
 * A glyph, its value, a hairline slash, the author. The slash sits at
 * `forest/25` and is `aria-hidden`: it is a mark between two fields, not
 * punctuation anyone needs read to them.
 */
function RecordLine({
  post,
  withReadingTime = false,
}: {
  post: PostSummary;
  withReadingTime?: boolean;
}) {
  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.6875rem] text-forest/70">
      {withReadingTime && (
        <>
          <Clock className="h-3 w-3 text-forest/55" strokeWidth={1.75} aria-hidden="true" />
          <span className="whitespace-nowrap">{post.readingTime} min</span>
          <span aria-hidden="true" className="text-forest/25">
            /
          </span>
        </>
      )}
      <CalendarDays className="h-3 w-3 text-forest/55" strokeWidth={1.75} aria-hidden="true" />
      <span className="whitespace-nowrap">{formatDateShort(post.date)}</span>
      <span aria-hidden="true" className="text-forest/25">
        /
      </span>
      <span className="truncate">{post.author}</span>
    </p>
  );
}

/**
 * Title link. Carries the stretched-link behaviour so the whole cell is
 * clickable off one tab stop, and draws a terracotta rule under itself when the
 * cell is hovered.
 *
 * Colour is set on the heading wrapper and inherited, not passed here:
 * `text-forest` and the size classes collide in tailwind-merge, and the size
 * class wins.
 *
 * Set in title case for the same reason the article hero is: a card title is
 * typeset copy, and `test blog` or `TEST BLOG` out of the admin editor should
 * not decide how the row is set. The stored title is untouched.
 */
function CellTitle({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={cn('stretched-link font-display', className)}>
      <span className="underline-draw">{toTitleCase(post.title)}</span>
    </Link>
  );
}

/**
 * Title colour holds on hover: the drawn rule under it is the only hover signal
 * it needs, and recolouring the whole heading as well reads as too much.
 */
const CELL_TITLE_COLOUR = 'text-forest';

/**
 * A plate that fills its frame, with the reading time pinned inside it. The
 * frame owns the aspect ratio or the stretch; the plate only fills it.
 *
 * With no hero, the frame holds its shape and shows the category's initial on
 * the plate's own sage. That is only wanted where the cell sits in a grid of
 * fixed rhythm — the home page runs three abreast, and one short card in a row
 * of three reads as a rendering fault. The listing and the read-next band drop
 * the plate entirely and close the gap.
 */
function CellPlate({
  post,
  sizes,
  priority,
  frameClassName,
  chipClassName,
}: {
  post: PostSummary;
  sizes: string;
  priority?: boolean;
  frameClassName: string;
  chipClassName: string;
}) {
  return (
    <div className={cn('relative shrink-0', frameClassName)}>
      {post.hero ? (
        <BlogPlate
          src={post.hero.url}
          alt=""
          sizes={sizes}
          priority={priority}
          radiusClassName="rounded-none"
          className="absolute inset-0"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-sage-light">
          <span className="font-display text-[2.5rem] leading-none text-sage" aria-hidden="true">
            {post.categoryLabel.charAt(0)}
          </span>
        </div>
      )}
      <ReadingTimeChip minutes={post.readingTime} className={chipClassName} />
    </div>
  );
}

export default function BlogPostCell({
  post,
  variant,
  withPlate = true,
  className,
}: BlogPostCellProps) {
  const hero = withPlate ? post.hero : null;

  if (variant === 'lead') {
    return (
      /*
       * The listing's opening cell: the index row at full width, with the band
       * grown to nearly half the card. Its excerpt runs at 14px rather than the
       * 13px the smaller cells use, because the ratio is what the type scale is
       * protecting and a 32px title against 13px is a different relationship,
       * not the same one bigger.
       */
      <article className={cn('group relative flex flex-col md:flex-row', BLOG_CARD_SURFACE, className)}>
        {hero && (
          <CellPlate
            post={post}
            sizes="(max-width: 768px) 100vw, 46vw"
            priority
            frameClassName="aspect-[2/1] w-full md:aspect-auto md:w-[46%] md:self-stretch"
            chipClassName="right-3"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-center p-5 md:p-6">
          <CategoryEyebrow label={post.categoryLabel} gated={post.visibility === 'owners'} />

          <h2 className={cn('mt-2.5', CELL_TITLE_COLOUR)}>
            <CellTitle post={post} className="text-[1.625rem] leading-[1.15] md:text-[2rem]" />
          </h2>

          <p className="mt-3 line-clamp-3 max-w-[52ch] text-sm leading-relaxed text-forest/85">
            {post.excerpt}
          </p>

          <RecordLine post={post} withReadingTime={!hero} />
        </div>
      </article>
    );
  }

  if (variant === 'index') {
    return (
      /*
       * A newspaper index row: picture, then text, on one line per post. The
       * band takes no aspect ratio of its own — its height is the row's, and
       * the crop follows — so two cells side by side never disagree about where
       * their pictures stop.
       */
      <article className={cn('group relative flex', BLOG_CARD_SURFACE, className)}>
        {hero && (
          <CellPlate
            post={post}
            sizes="(max-width: 640px) 112px, 160px"
            frameClassName="w-28 self-stretch sm:w-40"
            chipClassName="right-3"
          />
        )}

        {/* min-w-0 so a long unbroken title wraps instead of stretching the
            row. */}
        <div className="flex min-w-0 flex-1 flex-col p-4">
          <CategoryEyebrow label={post.categoryLabel} gated={post.visibility === 'owners'} />

          <h3 className={cn('mt-2', CELL_TITLE_COLOUR)}>
            <CellTitle post={post} className="text-xl leading-[1.25]" />
          </h3>

          {/* Clamped so an uneven pair of excerpts cannot throw the two
              columns out of step with each other. */}
          <p className="mt-2 line-clamp-2 max-w-[60ch] text-[0.8125rem] leading-relaxed text-forest/85">
            {post.excerpt}
          </p>

          <RecordLine post={post} withReadingTime={!hero} />
        </div>
      </article>
    );
  }

  /*
   * The two portrait cells: the home page's grid and the article's "Read next"
   * band. Same shape at two scales, the home card a little wider in its column
   * and so a little larger in the title.
   */
  const isHome = variant === 'home';

  return (
    <article
      className={cn('group relative flex h-full flex-col', BLOG_CARD_SURFACE, className)}
    >
      {/* The home card keeps its frame with or without a hero, so a row of
          three holds its rhythm. Read next drops it and closes the gap. */}
      {(hero || isHome) && (
        <CellPlate
          post={post}
          sizes={isHome ? '(max-width: 768px) 100vw, 33vw' : '(max-width: 640px) 100vw, 320px'}
          frameClassName={cn('w-full', isHome ? 'aspect-[16/10]' : 'aspect-[3/2]')}
          chipClassName="right-3"
        />
      )}

      <div className="flex flex-1 flex-col p-4">
        <CategoryEyebrow label={post.categoryLabel} gated={post.visibility === 'owners'} />

        {/*
         * From `md`, where the home grid runs three abreast, the title box is
         * reserved at two lines rather than merely capped: a one-line title in
         * the middle of a row would start its excerpt higher than its
         * neighbours'. Measured in em so the box tracks the type rather than a
         * hardcoded pixel height.
         *
         * Below `md` the grid is a single column, so there is no row to align
         * to and the reservation is just a hole under a short title. The
         * read-next band runs looser and never wants it.
         */}
        <h3
          className={cn(
            'mt-2',
            CELL_TITLE_COLOUR,
            isHome && 'md:line-clamp-2 md:min-h-[2.4em]'
          )}
        >
          <CellTitle
            post={post}
            className={isHome ? 'text-[1.375rem] leading-[1.2]' : 'text-lg leading-snug'}
          />
        </h3>

        {/* The record band is pinned to the bottom by the flex column, so cards
            in a row stay the same height whatever their excerpts do. */}
        <p className="mt-2 line-clamp-3 text-[0.8125rem] leading-relaxed text-forest/85">
          {post.excerpt}
        </p>
      </div>

      <RecordBand post={post} withReadingTime={!hero && !isHome} />
    </article>
  );
}
