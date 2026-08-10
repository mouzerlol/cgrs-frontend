'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isNonOptimizableImageSrc } from '@/lib/image';
import type { LightboxImage } from '@/types';

/**
 * Which side of the product the overlay is serving, which decides its radius
 * (see DESIGN.md, Dual radius doctrine). Community rounds, management squares.
 *
 * It is a prop rather than something derived from the route because a component
 * that silently changes shape depending on where it is mounted cannot be tested
 * or overridden. The default is community, so existing call sites keep the shape
 * they had.
 */
export type OverlayIdentity = 'community' | 'management';

interface ImageLightboxProps {
  /** Images to navigate (full-size `url`, thumbnail strip uses `thumbnail`). */
  images: LightboxImage[];
  /** Initial slide index when opening. */
  initialIndex?: number;
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Called when the dialog should close (backdrop click, Escape, close control). */
  onClose: () => void;
  /** Which identity's corner radius to wear. Defaults to community. */
  identity?: OverlayIdentity;
  /**
   * What the caption bar is made of.
   *
   * `scrim` is the default and the original: a forest-light bar floating a gap
   * below the picture, in the same family as the scrim behind it.
   *
   * `paper` is the blog's, and it makes the two one object — a forest-light
   * ledge butted against the photograph's bottom edge with the radius only on
   * its outer corners, which is exactly how the article's cover print and its
   * ledge are built (`ArticleCoverPlate`). Opening a picture out of that rail
   * should not
   * change what kind of thing it is. The picture's own corners stay square at
   * full size: this is the view where the frame is shown whole, and rounding it
   * would crop four bites out of the one place it is not cropped.
   */
  captionSurface?: 'scrim' | 'paper';
}

/*
 * The darkroom, per DESIGN.md §5 Overlays.
 *
 * Viewing a photograph full size dims the page to a print room rather than to a
 * void: a forest scrim carrying the site's own grain, so the dark reads as
 * material instead of as absence. The navigation controls are the site's
 * furniture — bone paper chips with forest glyphs, always findable against
 * whatever the picture happens to be doing at that edge — while close and the
 * caption bar are forest-light, so the one bright thing left in the room is the
 * photograph.
 *
 * Nothing here is `bg-black`. Pure black is forbidden system-wide, and a black
 * scrim under a warm-toned site reads as a different product's lightbox dropped
 * into this one.
 */
const SCRIM = 'fixed inset-0 bg-forest/95 backdrop-blur-sm texture-grain';

/**
 * The paper chip: an opaque bone surface with a forest glyph, tinted forest
 * shadow, terracotta focus ring against a forest offset.
 *
 * Opaque rather than the translucent white pill a stock lightbox ships with, for
 * the same reason the blog's hero chips are opaque: a control sitting on a
 * photograph that hands its contrast to whatever is behind it has no contrast at
 * all on the wrong frame.
 */
const CHIP_BASE =
  'inline-flex items-center justify-center ' +
  'shadow-[0_8px_22px_rgba(26,34,24,0.35)] transition-colors duration-200 ' +
  'focus:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-forest';

/** Navigation chips: paper, so they read as furniture laid beside the picture. */
const CHIP = cn(CHIP_BASE, 'bg-bone text-forest hover:bg-sage-light');

/**
 * Close is the one chip that is not paper.
 *
 * It sits above the frame on the scrim rather than beside the photograph, and a
 * bone square up there reads as a second, smaller print hanging over the real
 * one. Forest-light with a white glyph keeps it in the scrim's own family — an
 * exit from the room, not another object in it.
 */
const CLOSE_CHIP = cn(CHIP_BASE, 'bg-forest-light text-white hover:bg-forest');

/** Fallback stage proportion before the picture has reported its own. */
const DEFAULT_RATIO = 3 / 2;

/*
 * What the picture is not allowed to occupy: the furniture stacked above and
 * below it, plus the scroller's own padding.
 *
 * The stage takes its height from the viewport (58vh, 68vh from `sm`), and the
 * close chip, the caption ledge and the thumbnail strip are added to that — so
 * the panel is always taller than the fraction of the window it asked for. Past
 * a certain point (a viewport under ~484px tall, which a short window or a
 * zoomed page both reach) the panel outgrows the window, and the scroller
 * behind it — `fixed inset-0 overflow-y-auto` — grows a scrollbar of its own.
 *
 * That scrollbar is the visible bug. The document already reserves a permanent
 * gutter (`scrollbar-gutter: stable` in globals.css), and the fixed scroller
 * stops at the inside edge of it, so the second bar lands *beside* the page's
 * own — two tracks at the right edge — and takes 15px out of the scroller as it
 * appears, which shifts the photograph and everything under it sideways.
 *
 * Subtracting the furniture from the stage's height budget means the panel
 * fits the window at every size, so the scroller never has anything to scroll.
 * The `overflow-y-auto` stays as the backstop for what these figures cannot
 * predict — chiefly a caption that runs to three lines on a narrow stage.
 */
/** Close chip (`h-11`) and the gap below it (`mb-3`). */
const CLOSE_ROW = 56;
/** Paper ledge: `py-3.5` and one line of `text-sm` at `leading-relaxed`. */
const CAPTION_PAPER = 51;
/** Scrim bar: the same line, plus `mt-4` and the shallower `py-2.5`. */
const CAPTION_SCRIM = 59;
/** Thumbnail strip: `mt-4` and `h-12`. */
const THUMB_STRIP = 64;
/** Room for rounding and for a caption that wraps to a second line. */
const RESERVE_SLACK = 24;

/**
 * Full-screen image lightbox with prev/next, keyboard navigation, a caption bar,
 * and an optional thumbnail strip.
 *
 * Use with `LightboxImage` (or compatible shapes such as `ThreadImage` /
 * resolved task images).
 */
export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  identity = 'community',
  captionSurface = 'scrim',
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  /*
   * The stage takes the picture's own proportion once it has loaded, so the
   * caption bar sits under the photograph's bottom edge rather than under a box
   * the photograph happens to be centred in. The old fixed `aspect-[4/3]` shrank
   * every 3:2 frame to fit a shape none of them were.
   *
   * Cleared on every slide change: carrying the previous picture's ratio into
   * the next one puts a visible reflow on the swap.
   */
  const [ratio, setRatio] = useState<number | null>(null);

  const square = identity === 'management';
  const radius = square ? 'rounded-none' : 'rounded-md';
  const paperCaption = captionSurface === 'paper';

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    setRatio(null);
  }, [currentIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];
  const currentCaption = currentImage.caption || currentImage.alt;
  const multiple = images.length > 1;
  const stageRatio = ratio ?? DEFAULT_RATIO;

  /* Everything in the panel that is not the photograph, which the stage's
     height budget has to give back. */
  const chrome =
    CLOSE_ROW +
    (currentCaption || multiple ? (paperCaption ? CAPTION_PAPER : CAPTION_SCRIM) : 0) +
    (multiple ? THUMB_STRIP : 0) +
    RESERVE_SLACK;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1100]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200 motion-reduce:duration-0"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150 motion-reduce:duration-0"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={SCRIM} aria-hidden="true" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200 motion-reduce:duration-0"
              enterFrom="opacity-0 scale-[0.98]"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150 motion-reduce:duration-0"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.98]"
            >
              {/*
               * The panel shrink-wraps the photograph.
               *
               * The stage is sized from a fixed height and the picture's own
               * ratio, so its width is the picture's width and every other piece
               * of chrome inherits it: close lands on the frame's top-right
               * corner, the arrows sit against its sides, and the caption bar is
               * exactly as wide as the image it describes.
               *
               * A `w-full` panel with an aspect-ratio stage cannot do this. Once
               * `max-height` binds, the box stays full width and the picture
               * floats in the middle of it with the controls stranded 250px out
               * at the panel's edge.
               *
               * `max-w-full` is the escape hatch for a very wide frame on a
               * narrow viewport: width clamps, and that one case letterboxes
               * vertically inside a transparent box, which nobody can see.
               */}
              <DialogPanel
                className="relative max-w-full"
                style={{ width: 'fit-content' }}
              >
                {/*
                 * Close sits above the stage rather than on it. A control laid
                 * over the top-right corner of a photograph is covering the
                 * picture the reader opened the overlay to see.
                 */}
                <div className="mb-3 flex justify-end">
                  <button
                    onClick={onClose}
                    className={cn(CLOSE_CHIP, radius, 'h-11 w-11')}
                    aria-label="Close image viewer"
                    type="button"
                  >
                    <X className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                {/*
                 * The stage is sized from its width rather than its height, and
                 * that is what makes it wrap the picture at every viewport.
                 *
                 * `--lb-ratio` turns the intended height into a width, and
                 * `aspect-ratio` gives the height back. When `max-w-full` binds —
                 * a wide frame on a phone — the width clamps and the height
                 * follows it down, so the box stays the photograph's own box. A
                 * fixed `h-[58vh]` could not: the height held, the width clamped,
                 * and the picture letterboxed inside a stage taller than itself,
                 * leaving the caption bar stranded a couple of hundred pixels
                 * below the frame it describes.
                 *
                 * The height the ratio is applied to is the smaller of the
                 * viewport fraction and what is left of the window once the
                 * panel's own furniture is subtracted (`--lb-chrome`, plus the
                 * scroller's padding). Both terms are heights, so the clamp
                 * shrinks the whole stage rather than letterboxing it, and the
                 * panel fits the window at every size — which is what keeps the
                 * scroller from growing a second scrollbar beside the page's own.
                 */}
                <div
                  className={cn(
                    'relative mx-auto max-w-full',
                    'w-[calc(min(58vh,100dvh_-_2rem_-_var(--lb-chrome))*var(--lb-ratio))]',
                    'sm:w-[calc(min(68vh,100dvh_-_3rem_-_var(--lb-chrome))*var(--lb-ratio))]'
                  )}
                  style={
                    {
                      aspectRatio: stageRatio,
                      '--lb-ratio': String(stageRatio),
                      '--lb-chrome': `${chrome}px`,
                    } as React.CSSProperties
                  }
                >
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt || `Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                    unoptimized={isNonOptimizableImageSrc(currentImage.url)}
                    onLoad={(event) => {
                      const { naturalWidth, naturalHeight } = event.currentTarget;
                      if (naturalWidth > 0 && naturalHeight > 0) {
                        setRatio(naturalWidth / naturalHeight);
                      }
                    }}
                  />

                  {multiple && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrevious}
                        className={cn(
                          CHIP,
                          radius,
                          'absolute left-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 sm:-left-5'
                        )}
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" aria-hidden />
                      </button>

                      <button
                        type="button"
                        onClick={goToNext}
                        className={cn(
                          CHIP,
                          radius,
                          'absolute right-2 top-1/2 z-10 h-11 w-11 -translate-y-1/2 sm:-right-5'
                        )}
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden />
                      </button>
                    </>
                  )}
                </div>

                {/*
                 * The caption bar recedes rather than competing: forest-light
                 * under bone text at 10.1:1, with the counter in amber mono. A
                 * slide count is exactly the "timestamps, reply counts, lower-key
                 * metadata" amber is for on the community side, and mono is the
                 * system's only face for fixed-width data.
                 */}
                {(currentCaption || multiple) && (
                  <div
                    className={cn(
                      'flex items-baseline gap-3',
                      paperCaption
                        ? /*
                           * No top margin and no top radius: the bar is the
                           * ledge under the print, and a gap or a rounded
                           * shoulder here would split one object into two. The
                           * outer corners take the article's own 20px, the same
                           * figure `ArticleCoverPlate` and `BodyPlate` run.
                           *
                           * Same forest-light and bone the `scrim` bar wears —
                           * the two differ in where they sit, not in what they
                           * are made of. It was bone paper while the article's
                           * furniture was; the rail's ledge is forest now, and
                           * opening a picture out of that rail should not change
                           * the colour of the thing the caption is written on.
                           */
                          /*
                           * `w-0 min-w-full` keeps the bar exactly as wide as
                           * the picture. The panel is `fit-content`, so a long
                           * caption would otherwise set the panel's width by its
                           * own max-content and leave the photograph floating in
                           * the middle of a bar wider than itself. A zero width
                           * contributes nothing to that measurement while the
                           * percentage minimum — ignored during intrinsic sizing,
                           * applied during layout — fills the stage's width once
                           * the stage has decided it.
                           */
                          'w-0 min-w-full rounded-b-[20px] bg-forest-light px-5 py-3.5 text-bone'
                        : cn('mt-4 bg-forest-light px-4 py-2.5 text-bone', radius)
                    )}
                  >
                    {multiple && (
                      <span
                        /* Amber on forest-light, whichever surface this is: both
                           bars are that colour now, and the pair differ only in
                           geometry. */
                        className="shrink-0 font-mono text-xs text-amber"
                      >
                        {currentIndex + 1} / {images.length}
                      </span>
                    )}
                    {currentCaption && <p className="text-sm leading-relaxed">{currentCaption}</p>}
                  </div>
                )}

                {multiple && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          'relative h-12 w-12 overflow-hidden ring-2 transition-all duration-200',
                          'focus:outline-none focus-visible:ring-terracotta',
                          radius,
                          idx === currentIndex
                            ? 'opacity-100 ring-bone'
                            : 'opacity-50 ring-transparent hover:opacity-80'
                        )}
                        aria-label={`Show image ${idx + 1}`}
                        aria-current={idx === currentIndex ? 'true' : undefined}
                      >
                        <Image
                          src={img.thumbnail || img.url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized={isNonOptimizableImageSrc(img.thumbnail || img.url)}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
