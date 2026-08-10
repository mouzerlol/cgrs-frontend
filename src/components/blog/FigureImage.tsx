'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ui/ImageLightbox';
import type { LightboxImage } from '@/types';
import type { FigureBlock } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';

/**
 * An in-article photograph, and the way into it.
 *
 * The picture is set on the body's own measure, which on a phone is under 350px
 * wide — small enough that a site plan, a scanned notice, or a wide landscape
 * arrives as something the reader can see is there but cannot actually read.
 * The same `ImageLightbox` every other picture on the site opens into is what
 * answers that, so the gesture is the one they already know from a discussion
 * thread, a task's photographs, or the article's own hero print.
 *
 * The client boundary lives here rather than in `blocks/Figure.tsx` on purpose.
 * `BlockRenderer` and everything under `blocks/` must stay free of `use client`
 * — the public article page is a server component and would be dragged off the
 * server by one — so the interactive part is a separate module the block imports.
 * A server component rendering a client one costs nothing; a `use client` in the
 * renderer's own directory costs the whole page.
 */

/**
 * The hit target: the print itself.
 *
 * A `button` wrapping the image rather than an overlay laid over a `figure`, as
 * `ArticleCoverPlate` needs — that one has to keep its caption inside the target
 * and a `figure` cannot live inside a button, which is not a problem here. The
 * caption stays outside, where it is copy rather than a control.
 *
 * Focus paints an outline rather than a ring: there is no fixed colour behind an
 * article's figure — it may sit on the body plate, on open photograph at the
 * page's foot, or on plain bone — and terracotta is the system's focus colour on
 * all of them.
 */
const TARGET =
  'group relative block w-full cursor-zoom-in overflow-hidden rounded-card ' +
  'border border-bone-edge bg-sage-light focus:outline-none ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ' +
  'focus-visible:outline-terracotta';

/**
 * The expand mark: a bone paper chip with a forest glyph, in the print's
 * bottom-right corner.
 *
 * Opaque, and that is the whole reason it is a chip rather than a bare icon. A
 * translucent control on a photograph has whatever contrast the photograph
 * happens to give it at that corner, which on a bright sky is none — the same
 * rule the lightbox's own navigation chips and the hero card follow.
 *
 * Always drawn rather than revealed on hover. Hover does not exist on the device
 * where a 340px-wide figure most needs opening, and an affordance nobody can
 * find is the same as no affordance. Hover only warms it to terracotta.
 */
const CHIP =
  'pointer-events-none absolute bottom-3 right-3 inline-flex h-8 w-8 items-center ' +
  'justify-center rounded-md border border-bone-edge bg-bone text-forest/70 ' +
  'shadow-[0_4px_14px_rgba(26,34,24,0.22)] transition-colors duration-200 ease-out-custom ' +
  'group-hover:text-terracotta group-focus-visible:text-terracotta';

export default function FigureImage({ block }: { block: FigureBlock }) {
  const [isOpen, setIsOpen] = useState(false);

  const label = block.caption ?? block.alt;

  const images: LightboxImage[] = [
    {
      id: block.url,
      url: block.url,
      thumbnail: block.url,
      alt: block.alt,
      /* Set the way the rail's ledge and its lightbox are, so every picture in
         the piece carries its caption in the same case. */
      caption: toTitleCase(block.caption ?? block.alt),
    },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={TARGET}
        aria-label={label ? `View image full size: ${label}` : 'View image full size'}
      >
        {/*
         * The intrinsic dimensions come from the block rather than being
         * guessed, so the figure reserves its space before the file arrives and
         * the copy below it does not jump. That is the whole reason the writer
         * records them at upload.
         *
         * Rendered through `next/image` against the declared content origin: an
         * image from an undeclared host fails configuration rather than quietly
         * serving a full-resolution original to a phone.
         */}
        <Image
          src={block.url}
          alt={block.alt}
          width={block.width}
          height={block.height}
          sizes="(min-width: 768px) 42rem, 100vw"
          className="h-auto w-full"
        />

        <span className={cn(CHIP)} aria-hidden="true">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      {/* Same paper ledge the article's cover print opens onto, so every picture
          in the piece enlarges into the same object. */}
      <ImageLightbox
        images={images}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        captionSurface="paper"
      />
    </>
  );
}
