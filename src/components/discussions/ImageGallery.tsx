'use client';

import { forwardRef, HTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isNonOptimizableImageSrc } from '@/lib/image';
import type { ThreadImage } from '@/types';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface ImageGalleryProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of images to display */
  images: ThreadImage[];
  /** Maximum images to show before "show more" */
  maxVisible?: number;
}

/**
 * The photographs attached to an opening post, and the way into them.
 *
 * They hang in a forest field that runs the full width of the body column.
 * A photograph laid straight on the card's white loses its own edge — a bright
 * sky or a pale wall simply continues into the page, and the reader cannot tell
 * where the picture stops. The dark ground states that boundary without a
 * border, and it is the house dark rather than a pure black, so the band reads
 * as part of the site instead of a hole cut in the card.
 *
 * The field is square and full-bleed to the column: the thread card is a
 * document (see `ThreadDetail`), and a rounded plate inside a square one reads
 * as a component that wandered in from the community side. The picture inside
 * it is rounded, because that is an object resting on the field, not the field.
 *
 * Never cropped. These are site plans, notices and screenshots as often as they
 * are scenery, and cropping the edge off a notice to fill a box costs the reader
 * the part they came for — so each picture keeps its own proportions and the
 * field pads around whatever shape arrives.
 */
const FIELD = 'w-full bg-forest rounded-none px-4 py-4 sm:px-6 sm:py-6';

/**
 * The hit target, shrink-wrapped to the picture.
 *
 * `inline-block` with an intrinsically-sized image rather than a fixed box with
 * `object-contain`: with a box, the letterboxing belongs to the button, so a
 * corner-pinned mark lands on empty field beside the photograph instead of on
 * it. Wrapping the image means the button's corner *is* the image's corner.
 *
 * Focus paints an outline in terracotta — the system's focus colour on every
 * ground, including this one.
 */
const TARGET =
  'group relative inline-block cursor-zoom-in leading-none focus:outline-none ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
  'focus-visible:outline-terracotta';

/**
 * The expand mark, carried across from the article figure (`blog/FigureImage`)
 * so the gesture is the one readers already know from the blog.
 *
 * A bone paper chip with a forest glyph, drawn always rather than revealed on
 * hover: hover does not exist on the phone where a picture most needs opening,
 * and an affordance nobody can find is the same as no affordance. Hover only
 * warms it to terracotta. Opaque, because a translucent control on a photograph
 * has whatever contrast the photograph happens to give it.
 */
const CHIP =
  'pointer-events-none absolute inline-flex items-center justify-center rounded ' +
  'border border-bone-edge bg-bone text-forest/70 ' +
  'shadow-[0_4px_14px_rgba(26,34,24,0.22)] transition-colors duration-200 ease-out-custom ' +
  'group-hover:text-terracotta group-focus-visible:text-terracotta';

const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(
  ({ images, maxVisible = 5, className, ...props }, ref) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const visibleImages = images.slice(0, maxVisible);
    const remainingCount = images.length - maxVisible;

    /* One picture gets the whole field and is served at full size; a set is a
       row of contact prints, small enough that the thumbnail is the right file. */
    const isSingle = visibleImages.length === 1;
    const isPair = visibleImages.length === 2;

    const openLightbox = (index: number) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
    };

    return (
      <>
        <div
          ref={ref}
          className={cn(FIELD, className)}
          {...props}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            {visibleImages.map((image, index) => {
              const source = isSingle ? image.url : image.thumbnail;
              const isLarge = isSingle || isPair;

              return (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className={TARGET}
                  aria-label={`View image ${index + 1} full size: ${image.alt || 'Thread image'}`}
                >
                  {/*
                   * `width={0} height={0}` with a `sizes` hint is next/image's
                   * intrinsic-sizing form, and it is what these need: an
                   * attachment arrives as a URL with no recorded dimensions, so
                   * there is nothing to reserve space with. The caps below do
                   * the framing instead — the picture is never wider than the
                   * column and never taller than a screenful.
                   */}
                  <Image
                    src={source}
                    alt={image.alt || `Image ${index + 1}`}
                    width={0}
                    height={0}
                    /* The hint is what decides the rendered width here, since
                       the intrinsic form has no declared dimensions to scale
                       from: a lone picture is served at the column's measure,
                       a set at contact-print size. */
                    sizes={isSingle ? '(min-width: 1024px) 60rem, 100vw' : '(min-width: 640px) 20rem, 50vw'}
                    className={cn(
                      'h-auto w-auto max-w-full rounded-lg',
                      isSingle && 'max-h-[28rem]',
                      isPair && 'max-h-56',
                      !isLarge && 'max-h-32',
                    )}
                    unoptimized={isNonOptimizableImageSrc(source)}
                  />

                  {/* Show remaining count on last visible image */}
                  {index === maxVisible - 1 && remainingCount > 0 ? (
                    <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-forest/70 text-lg font-semibold text-bone">
                      +{remainingCount}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        CHIP,
                        isLarge ? 'bottom-3 right-3 h-8 w-8' : 'bottom-1.5 right-1.5 h-6 w-6',
                      )}
                      aria-hidden="true"
                    >
                      <Maximize2 className={isLarge ? 'h-4 w-4' : 'h-3 w-3'} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lightbox Modal */}
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }
);

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
