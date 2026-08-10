'use client';

import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ui/ImageLightbox';
import type { LightboxImage } from '@/types';
import type { PostHero } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';
import BlogPlate from './BlogPlate';
import { RAIL_LEFT, RAIL_WIDTH } from './article-rail-geometry';

interface ArticleCoverPlateProps {
  /** The post's hero photograph, or nothing on a post that carries none. */
  hero?: PostHero | null;
  /**
   * Rendered below the print inside the same column, at `xl` only.
   *
   * The meta rail shares this margin, and stacking the two in one flow is what
   * lets the rail sit below a print whose height varies with the crop — an
   * `xl:pt-*` on a separately positioned element could not.
   */
  railMeta?: React.ReactNode;
}

/*
 * One photograph, in the page's right margin, and the mirror of its left one.
 *
 * `BlockRenderer` hangs a forest drop-cap block in a 7rem gutter on the left; the
 * cover sits in the open photograph the body plate leaves on the right, centred
 * in it rather than pushed against the container's edge, so the band of picture
 * reads the same width on both sides of the print.
 *
 * It only appears from `xl`. At `lg` the body plate leaves about 218px, which is
 * narrower than the print. Below `xl` the same object runs full width between
 * the breadcrumb band and the article.
 *
 * One picture, not a set. The article's cover is already the page's backdrop, so
 * a gallery hanging off it was three ways of saying the same thing; what the
 * reader actually wants from this corner of the page is the cover without the
 * hero's wash over it, and a line saying what it is.
 */

/**
 * 4:3.
 *
 * Generous enough to be a photograph rather than a strip, and it crops the
 * portrait frames these articles carry sensibly. The same ratio the blog's
 * listing plates run at, so the print reads as one of the site's pictures.
 */
const PRINT_ASPECT = 'aspect-[4/3]';

/**
 * The hit area: the whole object, print and ledge both.
 *
 * An overlay rather than a wrapper. A `figure` is flow content and cannot live
 * inside a button, and splitting the two would leave the caption outside the
 * target, which is the half of the object a thumb is most likely to find.
 *
 * It paints an outline rather than a ring: there is no fixed colour behind this
 * to offset against, only whatever the photograph happens to be doing at that
 * edge. Terracotta is the system's focus colour and holds on all of them; bone
 * disappears into the hero's own wash.
 */
const HIT_AREA =
  'peer absolute inset-0 z-10 cursor-pointer focus:outline-none ' +
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-terracotta';

/**
 * The object: a square print on a forest-light ledge.
 *
 * No frame. The cover is already on screen full bleed behind the article, so the
 * picture needs no furniture arguing that it is a picture; what it needs is a
 * caption and a way in. The ledge carries both, under the photograph the way a
 * label sits under a mounted print rather than as a band laid over it.
 *
 * The print and the ledge are rounded as one object — 20px on the print's top
 * two corners and the ledge's bottom two, the same radius `BodyPlate` runs, with
 * the seam between them left square. The body plate beside it is a rounded panel
 * on the same photograph, and a square print next to it read as an oversight
 * rather than as a choice. The corner cut this once carried is still gone: that
 * was shaping on top of shape, and this only needs to agree with the plate.
 *
 * The print stays duotone and comes back to full colour on hover, which is the
 * treatment every other blog plate wears — and the reason it can sit a few
 * hundred pixels from the same photograph in colour without reading as a
 * duplicate crop of it. That reveal is the whole hover state: the print does not
 * move, and there is no elevation change to imply that it did. The lightbox
 * returns it to colour at page scale, so the click is a reveal rather than a
 * magnification.
 *
 * The object ends on a shadow rather than a hairline. It used to be `bone-edge`
 * round both halves — the ledge's own paper a shade darker — which worked while
 * the article was a set of bone panels on bone. Against the white sheet beside
 * it that line reads as an outline drawn round a picture, and it was never a
 * reliable edge over the photograph anyway: bone-on-bone vanishes wherever the
 * hero's wash has taken the frame near-white.
 *
 * The shadow it takes instead is `shadow-sheet`, shallow and in two layers, the
 * same pair the body sheet and the meta plaque wear. That is the point of it
 * being a token: this print, the sheet the article is set on, and the plaque
 * below it are three objects resting on one photograph, and they should be lit
 * as three objects on one photograph rather than each inventing its own edge.
 *
 * Shallow specifically. The tinted drop shadow this carried once was deep, and
 * it read as the ledge floating off the print it belongs to — that failure was
 * about depth, not about shadows.
 */
export function ArticleCoverFigure({
  image,
  sizes,
  onOpen,
}: {
  image: PostHero;
  sizes: string;
  onOpen: () => void;
}) {
  return (
    /*
     * The radius and the shadow live on the `figure`, not on the two halves.
     *
     * Its box is exactly the object — the print and the ledge are block-level
     * and full width — so putting the 20px here gives the shadow the silhouette
     * the reader actually sees. Split across the halves it would draw twice down
     * the seam between them, and hung on a square-cornered wrapper it would show
     * at all four corners of a rounded object.
     *
     * No rule round the outside. The plaque below this one is ruled internally,
     * but that rule divides its own two surfaces; here there is nothing outside
     * the print to divide it from except the photograph, and a hairline drawn
     * there reads as a frame round a picture that is already framed by being a
     * picture.
     */
    <figure className="group relative rounded-[20px] shadow-sheet">
      {/* First in the DOM so `peer-focus-visible` reaches the print below it. */}
      <button
        type="button"
        onClick={onOpen}
        className={HIT_AREA}
        aria-label={`View the hero photograph full size: ${image.caption ?? image.alt}`}
      />

      {/*
       * The ledge's own colour under the picture rather than nothing, so the box
       * is a surface for the moment before the image paints instead of a hole
       * onto the hero photograph behind it.
       */}
      <div
        className={cn(
          PRINT_ASPECT,
          'relative w-full overflow-hidden rounded-t-[20px] bg-forest-light',
        )}
      >
        {/*
         * No `width`/`height` here on purpose. This box already imposes 4:3,
         * which is what `BlogPlate` asks callers to omit the intrinsic size
         * for: supplying it renders the colour layer at the photograph's own
         * proportions, top-anchored and clipped, while the duotone layer above
         * it stays a centred `object-cover` crop. The two agreed only for a
         * picture that happened to be 4:3 — on anything taller the hover
         * revealed a different framing of the same image, which read as the
         * print zooming out rather than as it coming back to colour.
         */}
        <div className="absolute inset-0">
          <BlogPlate
            src={image.url}
            alt={image.alt}
            sizes={sizes}
            className="h-full w-full rounded-none"
          />
        </div>
      </div>

      {/*
       * 13px rather than the `text-xs` the old caption band ran at. That band
       * was white on forest in the frame's own top edge, where small and tight
       * was the point; this is one line of editorial copy on its own paper, and
       * it is the only caption left on the page.
       */}
      {/*
       * Forest-light with bone type, not bone paper with forest type.
       *
       * The ledge is the same object as the meta plaque below it — a label under
       * a thing, in the page's right margin — and while it was bone the column
       * ran paper, then green, for two items doing one job. On forest the two
       * read as one set of furniture, and the print above stops being a bone
       * object stacked on a bone object with a seam between them.
       */}
      {/*
       * More room on the left than on the right. The caption is the ledge's
       * only text and it starts on a rounded corner, so a symmetric inset put
       * the first glyph nearly on the curve; the glyph on the right is an icon,
       * which is optically inset by its own bounding box already.
       */}
      <figcaption className="relative flex items-center gap-3 rounded-b-[20px] bg-forest-light py-2.5 pl-5 pr-3">
        <span className="min-w-0 flex-1">
          {/*
           * Set through `toTitleCase`, the same helper the hero heading runs
           * through. CSS `capitalize` would lift each first letter and leave
           * the rest as typed, so `TEST PHOTO` would stay shouting; this
           * lowercases the tail and keeps the listed acronyms whole.
           */}
          <span className="line-clamp-2 block text-[0.8125rem] leading-snug text-bone">
            {toTitleCase(image.caption ?? image.alt)}
          </span>
          {/*
           * The credit sits under the caption rather than beside it: it is
           * attribution, not description, and on one line the two ran together
           * as a single sentence that read as neither.
           */}
          {image.credit && (
            <span className="mt-0.5 block text-[0.625rem] uppercase tracking-[0.1em] text-sage">
              {image.credit}
            </span>
          )}
        </span>
        {/*
         * Terracotta at rest rather than on hover. It was a sage glyph that lit
         * up, which made the one affordance on the object invisible until the
         * pointer was already on it — and the hover state this print actually
         * has is the picture coming back to colour, which says nothing about
         * where to click. The accent is the only mark on the ledge, so it can
         * carry the accent without competing with anything.
         */}
        <Maximize2
          className="h-3.5 w-3.5 shrink-0 text-terracotta"
          aria-hidden="true"
        />
      </figcaption>
    </figure>
  );
}

export default function ArticleCoverPlate({ hero, railMeta }: ArticleCoverPlateProps) {
  const [isOpen, setIsOpen] = useState(false);

  // The column still renders when there is no photograph: the rail's facts are
  // not conditional on one, and a post without a hero is ordinary.
  if (!hero) {
    if (!railMeta) return null;
    return (
      <>
        <aside className="pointer-events-none relative z-10 hidden xl:block" aria-label="About this post">
          <div className="container">
            <div className="pointer-events-auto" style={{ marginLeft: RAIL_LEFT, width: RAIL_WIDTH }}>
              {railMeta}
            </div>
          </div>
        </aside>

        {/* Below `xl` the plaque runs on its own, in flow above the copy. */}
        <div className="pb-8 xl:hidden">
          <div className="container">
            <div className="max-w-[27rem]">{railMeta}</div>
          </div>
        </div>
      </>
    );
  }

  const lightboxImages: LightboxImage[] = [
    {
      id: hero.url,
      url: hero.url,
      thumbnail: hero.url,
      alt: hero.alt,
      /* Title-cased here rather than in `ImageLightbox`: the lightbox also
         carries discussion and work-item photographs, whose captions are
         someone's own sentence and stay as typed. The blog's captions are set
         copy, and the bar the print opens into has to match the ledge it came
         from. */
      caption: toTitleCase(hero.caption ?? hero.alt),
    },
  ];

  /*
   * 432px is the 27rem cap, which now holds at every width above a phone: the
   * column allows no more at `xl`, and the strip below it is capped to the same
   * figure. Only a viewport narrower than the cap actually asks for `100vw`.
   */
  const slot = (
    <ArticleCoverFigure
      image={hero}
      sizes="(min-width: 480px) 432px, 100vw"
      onOpen={() => setIsOpen(true)}
    />
  );

  return (
    <>
      {/*
       * The column, centred in the open photograph beside the body plate from
       * `xl`. It starts on the plate's right edge and centres what is left, so
       * the picture reads the same width on either side of the print instead of
       * banking it all against the container's gutter.
       *
       * In flow rather than absolute, stacked on the body plate by the grid
       * `ArticleContent` puts the two in, so the cell grows to whichever is
       * taller. `z-10` keeps it painted — and hit-tested — above the body plate
       * cell that comes after it, which would otherwise swallow the click.
       */}
      <aside
        className="pointer-events-none relative z-10 hidden xl:block"
        aria-label="About this post"
      >
        <div className="container">
          {/*
           * Placed from `article-rail-geometry` rather than from utilities: the
           * column is derived from the body plate's own right edge, which is an
           * expression, not a scale step.
           */}
          <div className="pointer-events-auto" style={{ marginLeft: RAIL_LEFT, width: RAIL_WIDTH }}>
            {slot}
            {railMeta && <div className="mt-6">{railMeta}</div>}
          </div>
        </div>
      </aside>

      {/*
       * `pb-8` because `BodyPlate` hangs its surface 2.5rem above its own copy,
       * which puts the plate's visible top edge on this wrapper's foot. Without
       * the padding the print sits directly on it.
       *
       * Capped at the same 27rem the column allows at `xl`, and flush to the
       * container's own left gutter — the line the hero card and the crumbs
       * above it both start on, and what the print's flush left edge is for.
       * Uncapped it filled the width: 775px of photograph at a tablet size, a
       * slab that pushed the article most of a screen down the page for a
       * picture the reader has already seen behind the hero. One size at every
       * width also means the print reads as the same physical object rather
       * than as something that inflates with the viewport.
       */}
      {/*
       * Below `xl` the same two objects run in flow, in the column's own width,
       * between the hero card and the copy. The plaque used to be dropped at
       * this width and its facts restated as a line of small caps inside the
       * hero card — one set of facts in two voices, and the card carrying
       * furniture that belongs to the article. It is the same widget at every
       * width now; only where it sits changes.
       */}
      <div className="pb-8 xl:hidden">
        <div className="container">
          <div className="max-w-[27rem]">
            {slot}
            {railMeta && <div className="mt-6">{railMeta}</div>}
          </div>
        </div>
      </div>

      {/* Paper caption: the overlay shows the same print-on-a-ledge object the
          rail does, at full size and in the picture's own proportion. */}
      <ImageLightbox
        images={lightboxImages}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        captionSurface="paper"
      />
    </>
  );
}
