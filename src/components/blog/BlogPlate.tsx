import Image from 'next/image';
import { cn } from '@/lib/utils';
import { DUOTONE_FILTER_ID } from './DuotoneFilter';

interface BlogPlateProps {
  src: string;
  /**
   * Empty string marks the plate decorative. Use that in listing cells, where
   * the adjacent title already carries the meaning, and a real description on
   * the article hero.
   */
  alt: string;
  sizes: string;
  priority?: boolean;
  /**
   * The image's intrinsic pixel size, as the manifest carries it.
   *
   * Supplying both switches the plate from `fill` to an intrinsically sized
   * image, so the box reserves the picture's real proportions before the file
   * arrives and nothing below it moves when it does. Omit them where the caller
   * imposes an aspect ratio of its own — a listing thumbnail is a crop, and its
   * square is the point rather than the photograph's shape.
   */
  width?: number;
  height?: number;
  /** Rendered on a ledge beneath the plate. Omitted when neither is set. */
  caption?: string | null;
  credit?: string | null;
  /** Aspect ratio and any size constraints for the plate. */
  className?: string;
  /**
   * The plate's own corners. Defaults to the community `rounded-card`, which is
   * right for a plate sitting on bone with paper around it.
   *
   * Listing cells pass `rounded-none`, because there the plate runs to the
   * card's own edges and the card's radius is already doing the rounding. A
   * rounded plate inside a rounded card gives you two arcs a few pixels apart.
   */
  radiusClassName?: string;
}

/**
 * A duotone image plate: rounded 20px, forest-to-bone ramp, sitting directly on
 * bone paper. The photograph comes back to full colour while the enclosing
 * `.group` is hovered.
 *
 * That reveal is a crossfade between two copies of the same image rather than a
 * filter animation: the duotone is an SVG `feColorMatrix` chain, and CSS cannot
 * interpolate one away. Both copies resolve to the same optimised URL, so the
 * second costs a paint, not a download.
 *
 * Requires `<DuotoneFilter />` somewhere on the same page.
 */
export default function BlogPlate({
  src,
  alt,
  sizes,
  priority,
  width,
  height,
  caption,
  credit,
  className,
  radiusClassName = 'rounded-card',
}: BlogPlateProps) {
  const intrinsic = Boolean(width && height);

  const layers = (
    <>
      {intrinsic ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full object-cover"
        />
      ) : (
        <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" />
      )}

      <div
        className="duotone-layer absolute inset-0 opacity-100 transition-opacity duration-[400ms] ease-out-custom group-hover:opacity-0"
        style={{ filter: `url(#${DUOTONE_FILTER_ID})` }}
        aria-hidden="true"
      >
        <Image src={src} alt="" fill priority={priority} sizes={sizes} className="object-cover" />
      </div>
    </>
  );

  const plate = (
    <div className={cn('relative overflow-hidden bg-sage-light', radiusClassName, className)}>
      {layers}
    </div>
  );

  if (!caption && !credit) return plate;

  return (
    <figure>
      {plate}
      {/*
       * The label under a mounted print rather than a band laid over it: a
       * caption that sits on the photograph has to fight whatever the frame is
       * doing behind it, and this one only has to be read.
       */}
      <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm leading-snug text-forest/70">
        {caption && <span>{caption}</span>}
        {credit && (
          <span className="text-xs uppercase tracking-[0.1em] text-forest/50">{credit}</span>
        )}
      </figcaption>
    </figure>
  );
}
