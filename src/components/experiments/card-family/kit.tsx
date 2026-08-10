'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PostSummary } from '@/lib/blog/types';
import { cn } from '@/lib/utils';
import { DUOTONE_FILTER_ID } from '@/components/blog/DuotoneFilter';

/**
 * Shared vocabulary for the card-family experiments.
 *
 * The point of the exercise is that the three surfaces stop being three
 * implementations. So the plate, the title link, and the date formatting all
 * live here once, and an option only decides *arrangement, scale, and tone*.
 * Anything an option has to reinvent is a signal that the family does not hold.
 */

/**
 * The tone floor for recessive text, measured rather than eyeballed.
 *
 * "Let the less important fade away" runs into WCAG AA at around 65% forest.
 * On white, `forest/60` measures 3.9:1 and `forest/45` measures 2.6:1, so the
 * muted greys these cards want are all failures at 10 to 11px. Three steps that
 * pass, and nothing between them:
 *
 * | Step | On white / bone-light | Use |
 * |---|---|---|
 * | `text-forest`    | 15:1 | titles |
 * | `text-forest/85` | 7.4:1 | excerpts, the secondary read |
 * | `text-forest/70` | 5.3:1 | category, author, date, the record line |
 *
 * On a `sage-light` or `sage-lite` band the floor moves up one step to
 * `text-forest/80`, because the ground itself is darker. Recession past that
 * point has to come from size, weight and tracking, which is where the design
 * laws say it should come from anyway.
 *
 * Separators and rules that carry no meaning (`aria-hidden` slashes, hairlines)
 * are exempt: they are decoration, not text.
 */

/** The three surfaces every option has to satisfy. */
export type Surface = 'home' | 'readnext' | 'listing';

export const SURFACE_LABEL: Record<Surface, string> = {
  home: 'Home',
  readnext: 'Read next',
  listing: 'Blog listing',
};

export interface CardFamilyProps {
  post: PostSummary;
  surface: Surface;
  className?: string;
}

export type CardFamilyComponent = (props: CardFamilyProps) => React.ReactElement;

/**
 * How many lines of excerpt a surface gets. Fixed here rather than per option,
 * so a difference between two options is a difference in *design* and not in
 * how much text each one happened to be given.
 *
 * Home has a column to itself and can afford three. The listing row and the
 * "Read next" cell run in sets of two and three, where an uneven excerpt throws
 * neighbouring cells out of step.
 */
export function excerptClamp(surface: Surface): string {
  return surface === 'home' ? 'line-clamp-3' : 'line-clamp-2';
}

/**
 * The listing thumbnail's width. Narrow on a phone, because the landscape row
 * keeps its shape at every width and a 128px thumbnail leaves a title column
 * too narrow to set a headline in.
 *
 * `self-start` is load-bearing: these plates are flex children carrying an
 * aspect ratio, and the default `align-items: stretch` overrides the ratio and
 * pulls the picture into a column the height of the text beside it.
 */
export const LISTING_PLATE = 'w-24 shrink-0 self-start sm:w-32';

/* -------------------------------------------------------------------------- */
/* Date formatting                                                            */
/* -------------------------------------------------------------------------- */

/**
 * `2 Mar 2026`. Shorter than the site's `formatDate`, because every option here
 * sets the date as recessive metadata rather than as a line of prose, and
 * `2 March 2026` wraps in a 120px meta column.
 */
export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** `02.03.26`, for the options that set metadata as fixed-width data. */
export function numericDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

/** Day / month / year, split for the options that set the date as a stamp. */
export function stampParts(iso: string): { day: string; month: string; year: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString('en-NZ', { month: 'short' }).toUpperCase(),
    year: String(d.getFullYear()),
  };
}

/* -------------------------------------------------------------------------- */
/* Plate                                                                      */
/* -------------------------------------------------------------------------- */

interface LabPlateProps {
  post: PostSummary;
  sizes: string;
  /** Aspect ratio, width, and position. */
  className?: string;
  /** Defaults to the community `rounded-card`; option 09 squares it. */
  radiusClassName?: string;
  children?: React.ReactNode;
}

/**
 * `BlogPlate`, re-cut so an option can set its own corner radius and pin
 * content inside the frame. Same duotone crossfade: two copies of the image,
 * the filtered one fading out while the enclosing `.group` is hovered, because
 * an `feColorMatrix` chain is not something CSS can interpolate away.
 *
 * Needs a `<DuotoneFilter />` mounted on the same page.
 */
export function LabPlate({
  post,
  sizes,
  className,
  radiusClassName = 'rounded-card',
  children,
}: LabPlateProps) {
  if (!post.hero) {
    return (
      <LabPlateStandIn post={post} className={className} radiusClassName={radiusClassName}>
        {children}
      </LabPlateStandIn>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-sage-light', radiusClassName, className)}>
      <Image src={post.hero.url} alt="" fill sizes={sizes} className="object-cover" />

      <div
        className="duotone-layer absolute inset-0 transition-opacity duration-[400ms] ease-out-custom group-hover:opacity-0"
        style={{ filter: `url(#${DUOTONE_FILTER_ID})` }}
        aria-hidden="true"
      >
        <Image src={post.hero.url} alt="" fill sizes={sizes} className="object-cover" />
      </div>

      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Title                                                                      */
/* -------------------------------------------------------------------------- */

interface LabTitleProps {
  post: PostSummary;
  className?: string;
}

/**
 * The single tab stop and accessible name for a cell. Colour is set on the
 * wrapping heading and inherited: `text-forest` and the `text-heading-*` sizes
 * collide in tailwind-merge and the size class wins.
 */
export function LabTitle({ post, className }: LabTitleProps) {
  return (
    <Link href={`/blog/${post.slug}`} className={cn('stretched-link font-display', className)}>
      <span className="underline-draw">{post.title}</span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Placeholder for a post with no hero                                        */
/* -------------------------------------------------------------------------- */

/**
 * What stands where the plate would be when a post has none. Not an empty box:
 * the initial of the category, set large in the plate's own sage, so the cell
 * still reads as one of a set rather than as a broken one.
 */
export function LabPlateStandIn({
  post,
  className,
  radiusClassName = 'rounded-card',
  children,
}: {
  post: PostSummary;
  className?: string;
  radiusClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden bg-sage-light',
        radiusClassName,
        className
      )}
    >
      <span className="font-display text-[2.5rem] leading-none text-sage" aria-hidden="true">
        {post.categoryLabel.charAt(0)}
      </span>
      {children}
    </div>
  );
}
