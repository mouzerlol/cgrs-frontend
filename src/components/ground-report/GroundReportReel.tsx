'use client';

/**
 * Full-screen swipe reel. A flat slide list (title-per-zone + that zone's images)
 * advances by drag — vertical on mobile, horizontal on desktop — with snap, auto-roll
 * into the next zone, and loop at the end. Non-gesture nav (buttons + arrow keys) is
 * always available, and `prefers-reduced-motion` swaps drag-physics for a cross-fade.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, ExternalLink, ImageIcon, MapPin, X } from 'lucide-react';
import ReelMiniMap from '@/components/ground-report/ReelMiniMap';
import { buildSlides, resolveSwipe, wrapIndex, type ReelSlide } from '@/lib/ground-report/reel';
import type { MemberZoneReportResponse } from '@/types/ground-report';

const CTA_HREF = '/management-request?category=general';
const SWIPE_THRESHOLD = 60;

interface GroundReportReelProps {
  zones: MemberZoneReportResponse[];
  startIndex?: number;
  onClose: () => void;
  /** Called when a presigned image URL fails to load, so the parent can refetch. */
  onImageError?: () => void;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

export default function GroundReportReel({ zones, startIndex = 0, onClose, onImageError }: GroundReportReelProps) {
  const slides = useMemo<ReelSlide[]>(() => buildSlides(zones), [zones]);
  // `direction` drives the push: +1 = next pushes in from the leading edge, -1 = prev.
  const [{ index, direction }, setState] = useState(() => ({
    index: wrapIndex(startIndex, slides.length),
    direction: 0,
  }));
  // Image ids whose presigned URL 404'd — swapped for a fallback card instead of a broken icon.
  const [failedImageIds, setFailedImageIds] = useState<ReadonlySet<string>>(() => new Set());
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const go = useCallback(
    (delta: number) =>
      setState((s) => ({ index: wrapIndex(s.index + delta, slides.length), direction: delta })),
    [slides.length],
  );

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      go(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      go(-1);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    // Any direction navigates: up/left → next, down/right → prev (dominant axis wins).
    const delta = resolveSwipe(info.offset, SWIPE_THRESHOLD);
    if (delta !== 0) go(delta);
  };

  const markImageFailed = useCallback(
    (id: string) => {
      setFailedImageIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      onImageError?.();
    },
    [onImageError],
  );

  if (slides.length === 0) return null;
  const slide = slides[index];
  const markerCoord = slide.kind === 'image' ? { lat: slide.image.lat, lng: slide.image.lng } : null;

  const axis: 'x' | 'y' = isMobile ? 'y' : 'x';
  // Mobile accepts free swipes (up/down/left/right); desktop drags along the horizontal axis.
  const dragAxis: boolean | 'x' | 'y' = isMobile ? true : 'x';
  const transition = prefersReducedMotion
    ? { duration: 0.25 }
    : { type: 'spring' as const, stiffness: 320, damping: 36, mass: 0.9 };

  // TikTok/Tinder push: the incoming slide enters from the leading edge and shoves the
  // outgoing one off the opposite edge — both animate together (no `mode="wait"`).
  // Reduced-motion collapses to a cross-fade.
  type Custom = { direction: number; axis: 'x' | 'y' };
  const variants = {
    enter: ({ direction, axis }: Custom) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : { opacity: 1, [axis]: direction >= 0 ? '100%' : '-100%' },
    center: { opacity: 1, x: '0%', y: '0%' },
    exit: ({ direction, axis }: Custom) =>
      prefersReducedMotion
        ? { opacity: 0 }
        : { opacity: 1, [axis]: direction >= 0 ? '-100%' : '100%' },
  };

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Ground report reel"
      tabIndex={-1}
      onKeyDown={handleKey}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-forest outline-none"
      data-testid="ground-report-reel"
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reel"
        className="absolute right-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-none border border-bone/15 bg-forest/55 text-bone transition-colors hover:bg-forest/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Fixed locator map — never pans/zooms; marker tracks the current image.
          pointer-events-none so a swipe started over it still reaches the slide. */}
      <div className="pointer-events-none absolute left-3 top-3 z-40 sm:left-5 sm:top-5">
        <ReelMiniMap coord={markerCoord} />
      </div>

      {/* Slide */}
      <AnimatePresence initial={false} custom={{ direction, axis }}>
        <motion.div
          key={index}
          custom={{ direction, axis }}
          variants={variants}
          drag={prefersReducedMotion ? false : dragAxis}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={prefersReducedMotion ? undefined : handleDragEnd}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0 flex h-full w-full touch-none items-center justify-center"
          data-testid={`slide-${slide.kind}`}
        >
          {slide.kind === 'title' ? (
            <div className="relative flex h-full w-full items-end overflow-hidden" data-testid="title-slide">
              {/* Branding backdrop: the zone's cover photo under a deep forest wash,
                  so the title reads as a chapter card, not a blank screen. */}
              {slide.coverUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.coverUrl}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full scale-105 object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/85 to-forest/35" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_0%,theme(colors.forest.light),theme(colors.forest))]" />
              )}

              <div className="relative z-10 w-full px-6 pb-28 sm:px-12 sm:pb-32">
                <div className="mx-auto w-full max-w-3xl">
                  {/* Brand line */}
                  <div className="flex items-center gap-2.5 text-terracotta">
                    <span className="flex h-7 w-7 items-center justify-center rounded-none bg-terracotta text-bone">
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.28em] sm:text-sm">
                      Ground Report
                    </span>
                  </div>

                  <div className="mt-5 h-px w-16 bg-terracotta" />

                  <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-bone/55">
                    Area {slide.zoneIndex + 1} of {slide.zoneTotal}
                  </p>
                  <h2 className="mt-2 font-display text-[clamp(2.5rem,9vw,5rem)] leading-[0.95] text-bone">
                    {slide.label}
                  </h2>

                  <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-bone/80">
                    <span className="inline-flex items-center gap-1.5 border border-bone/25 px-3 py-1 font-medium uppercase tracking-wide text-bone">
                      {slide.period}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-bone/65">
                      <ImageIcon className="h-4 w-4" aria-hidden="true" />
                      {slide.imageCount} {slide.imageCount === 1 ? 'photo' : 'photos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {failedImageIds.has(slide.image.id) ? (
                <div
                  className="flex max-w-md flex-col items-center gap-3 px-8 text-center text-bone/70"
                  data-testid="image-fallback"
                >
                  <ImageIcon className="h-12 w-12 text-bone/40" aria-hidden="true" />
                  <p className="text-base font-medium text-bone/85">This photo couldn’t be loaded</p>
                  <p className="text-sm text-bone/55">
                    The link may have expired. Swipe on, or reopen the report to refresh.
                  </p>
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image.url}
                  alt={slide.image.caption ?? `${slide.label} photo`}
                  className="max-h-full max-w-full object-contain"
                  draggable={false}
                  onError={() => markImageFailed(slide.image.id)}
                />
              )}
              {slide.image.caption ? (
                <div
                  className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest via-forest/55 to-transparent px-6 pb-24 pt-20 text-bone"
                  data-testid="image-caption"
                >
                  <p className="mx-auto max-w-2xl text-center text-base leading-relaxed md:text-lg">
                    {slide.image.caption}
                  </p>
                </div>
              ) : null}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Prev / next controls (always available — gesture is never the only way) */}
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-3 top-1/2 z-30 hidden h-11 w-11 md:flex -translate-y-1/2 items-center justify-center rounded-none border border-bone/15 bg-forest/45 text-bone transition-colors hover:bg-forest/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-3 top-1/2 z-30 hidden h-11 w-11 md:flex -translate-y-1/2 items-center justify-center rounded-none border border-bone/15 bg-forest/45 text-bone transition-colors hover:bg-forest/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Mobile control dock — large tap targets at the bottom corners. Swiping any
          direction works too; these are the always-there fallback on touch. */}
      <div
        className="absolute inset-x-0 bottom-0 z-30 flex items-center justify-between px-4 pb-6 md:hidden"
        data-testid="reel-mobile-dock"
      >
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="flex h-14 w-14 items-center justify-center rounded-none border border-bone/20 bg-forest/60 text-bone backdrop-blur-sm transition-colors active:bg-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="flex h-14 w-14 items-center justify-center rounded-none border border-bone/20 bg-forest/60 text-bone backdrop-blur-sm transition-colors active:bg-forest/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      </div>

      {/* Slide indicator segments — square, terracotta marks the current frame */}
      <div className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5" data-testid="reel-dots">
        {slides.map((s, i) => (
          <span
            key={i}
            className={`h-1 transition-all duration-300 ${
              i === index
                ? 'w-6 bg-terracotta'
                : s.kind === 'title'
                  ? 'w-2.5 bg-bone/55'
                  : 'w-2 bg-bone/30'
            }`}
          />
        ))}
      </div>

      {/* Per-image report CTA — outline button, top center, photos only, out to general inquiry */}
      {slide.kind === 'image' ? (
        <Link
          href={CTA_HREF}
          className="absolute inset-x-0 bottom-[100px] z-40 flex items-center justify-center gap-2 rounded-none border-y border-bone/25 bg-forest/55 px-4 py-3 text-center text-sm font-semibold text-bone shadow-dock backdrop-blur-sm transition-colors hover:bg-forest/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-bone md:inset-x-auto md:bottom-auto md:left-1/2 md:top-4 md:max-w-[calc(100%-7rem)] md:-translate-x-1/2 md:border md:gap-2.5 md:px-6 md:py-3.5 md:text-base"
          data-testid="reel-cta"
        >
          Know something about this image? Report it here
          <ExternalLink className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
