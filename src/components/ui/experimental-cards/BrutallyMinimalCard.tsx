'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

/**
 * The wipe is deliberately asymmetric: black takes its time arriving, white
 * snaps back at twice the speed so leaving a card feels like a release.
 */
const WIPE_IN_MS = 960;
const WIPE_OUT_MS = WIPE_IN_MS / 2;
const WIPE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * How far the wipe slab is parked outside the card, as a % of its own height.
 * The slab is 200% of the card, so 150% clears the card's diagonal comfortably.
 */
const PARKED = 150;

type WipePhase = 'idle' | 'in' | 'out';

/**
 * Layer visibility per phase. `instant` kills the transition on the return to
 * idle so the layers can snap back underneath the white layer that is already
 * covering — otherwise the black would wipe back out in reverse.
 */
function phaseLayers(phase: WipePhase) {
  return { black: phase !== 'idle', white: phase === 'out', instant: phase === 'idle' };
}

/**
 * The wipe is a slab rotated 45deg so its leading edge runs perpendicular to the
 * bottom-left → top-right axis, then translated along that axis. Transform only,
 * so the compositor handles it without repainting the card on every frame.
 */
function slabTransform(covered: boolean) {
  return `rotate(45deg) translateY(${covered ? 0 : PARKED}%)`;
}

/**
 * Exact inverse of the slab transform. Applied to a same-sized child, it cancels
 * out to the identity matrix, so content held inside a moving slab stays visually
 * still while the slab's edge sweeps across it.
 */
function counterTransform(covered: boolean) {
  return `translateY(${covered ? 0 : -PARKED}%) rotate(-45deg)`;
}

function wipeTransition(ms: number) {
  return `transform ${ms}ms ${WIPE_EASE}`;
}

const BrutallyMinimalCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className, index = 0 }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);
    const [localRef, isVisible] = useIntersectionObserver<HTMLAnchorElement>({ threshold: 0.1 });
    const [phase, setPhase] = useState<WipePhase>('idle');
    const [reducedMotion, setReducedMotion] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const layers = phaseLayers(phase);

    useEffect(() => {
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      setReducedMotion(query.matches);
      const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }, []);

    // Each layer only ever moves in one direction: black on enter, white on
    // leave — so the duration belongs to the layer, not to the phase.
    const inMs = reducedMotion ? 0 : WIPE_IN_MS;
    const outMs = reducedMotion ? 0 : WIPE_OUT_MS;

    const clearReset = useCallback(() => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current);
        resetTimer.current = null;
      }
    }, []);

    const enter = useCallback(() => {
      clearReset();
      setPhase('in');
    }, [clearReset]);

    // White wipes in over the black, then every layer snaps back to parked
    // underneath — invisible, because white is covering at that moment.
    const leave = useCallback(() => {
      clearReset();
      setPhase('out');
      resetTimer.current = setTimeout(() => setPhase('idle'), outMs);
    }, [clearReset, outMs]);

    useEffect(() => clearReset, [clearReset]);

    const wipeStyle = (covered: boolean, instant: boolean, ms: number) => ({
      transform: slabTransform(covered),
      transition: wipeTransition(instant ? 0 : ms),
      willChange: phase === 'idle' ? undefined : 'transform',
    });

    const counterStyle = (covered: boolean, instant: boolean, ms: number) => ({
      transform: counterTransform(covered),
      transition: wipeTransition(instant ? 0 : ms),
      willChange: phase === 'idle' ? undefined : 'transform',
    });

    /**
     * One palette of the card's content. `withImage` is false for the wipe copies:
     * they leave the image box transparent so the single real <Image> underneath
     * shows through, rather than paying to decode and raster it three times.
     */
    const renderContent = (hovered: boolean, withImage: boolean) => (
      <div className={cn("flex flex-col h-full", isLarge ? "px-6 py-4 sm:px-8 sm:py-5" : "px-4 py-3 sm:px-6 sm:py-4")}>
        <div className={cn("flex justify-between items-start text-left", isLarge ? "gap-4 mb-3" : "gap-3 mb-2")}>
          <h3 className={cn("font-sans font-extrabold uppercase tracking-tight", hovered ? "text-white" : "text-black", isLarge ? "text-3xl md:text-5xl" : "text-lg leading-tight")}>
            {title}
          </h3>
          <div className="shrink-0 mt-1">
            <span className={cn("inline-block font-mono text-[10px] md:text-xs font-bold px-2 py-1 border", hovered ? "bg-white text-black border-white" : "bg-black text-white border-black")}>
              [ VIEW ]
            </span>
          </div>
        </div>

        {hasImage ? (
          <div className={cn("relative w-full flex-1 min-h-0 border mt-auto overflow-hidden", hovered ? "border-white" : "border-black")}>
            {withImage && (
              <Image
                src={image!}
                alt={title}
                fill
                className="object-cover grayscale group-hover:grayscale-0 transition-[filter] duration-[1080ms]"
                sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            )}
            <div className={cn("absolute pointer-events-none text-left", isLarge ? "bottom-6 left-6 right-6" : "bottom-4 left-4 right-4")}>
              <p className={cn("font-sans leading-snug", isLarge ? "text-lg md:text-xl" : "text-sm")}>
                <span className={cn("px-2.5 py-1 box-decoration-clone", hovered ? "bg-black text-white" : "bg-white text-black")}>
                  {description}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <p className={cn("font-sans text-left mb-6", hovered ? "text-white" : "text-black", isLarge ? "text-lg md:text-xl" : "text-sm")}>
            {description}
          </p>
        )}
      </div>
    );

    /**
     * A full copy of the card's content in the other palette, revealed by the same
     * card-wide slab that wipes the background — so text, chip and surface all
     * cross the diagonal together instead of each running its own local sweep.
     */
    const contentWipe = (hovered: boolean, covered: boolean, instant: boolean, ms: number, z: string) => (
      <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", z)}>
        <div className="absolute left-[-50%] top-[-50%] h-[200%] w-[200%] overflow-hidden" style={wipeStyle(covered, instant, ms)}>
          <div className="absolute inset-0" style={counterStyle(covered, instant, ms)}>
            <div className="absolute left-1/4 top-1/4 h-1/2 w-1/2">{renderContent(hovered, false)}</div>
          </div>
        </div>
      </div>
    );

    return (
      <Link
        ref={(node) => {
          // @ts-ignore - useIntersectionObserver returns a RefObject but we need to assign to it
          localRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        href={href}
        aria-label={title}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onFocus={enter}
        onBlur={leave}
        className={cn(
          'group relative isolate flex flex-col overflow-hidden bg-white rounded-none text-black',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[464px] md:min-h-[504px]' : 'min-h-[220px] md:min-h-[240px]',
          'fade-up',
          isVisible && 'visible',
          className
        )}
        style={{ transitionDelay: `${index * 0.08}s` }}
      >
        {/* Surface wipes sit below the image, so the image is never covered. */}
        <span aria-hidden className="pointer-events-none absolute left-[-50%] top-[-50%] h-[200%] w-[200%] -z-10 bg-black" style={wipeStyle(layers.black, layers.instant, inMs)} />
        <span aria-hidden className="pointer-events-none absolute left-[-50%] top-[-50%] h-[200%] w-[200%] -z-10 bg-white" style={wipeStyle(layers.white, layers.instant, outMs)} />

        <div className="relative z-10 h-full">{renderContent(false, true)}</div>

        {contentWipe(true, layers.black, layers.instant, inMs, 'z-20')}
        {contentWipe(false, layers.white, layers.instant, outMs, 'z-30')}
      </Link>
    );
  }
);
BrutallyMinimalCard.displayName = 'BrutallyMinimalCard';
export default BrutallyMinimalCard;
