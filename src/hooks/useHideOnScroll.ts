'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getFixedSiteHeaderHeight } from '@/lib/site-layout';

/** Ignore scroll deltas smaller than this (px) so jitter/overscroll doesn't flicker the chrome. */
const DEADZONE_PX = 8;
/** Tailwind `md` breakpoint — the collapse is mobile-only, below this width. */
const MD_BREAKPOINT_PX = 768;

export interface UseHideOnScrollOptions {
  /** When false, the chrome never collapses and no scroll listener is attached. */
  scrollHide?: boolean;
  /** When true (e.g. mobile menu open), force the chrome shown. */
  isMenuOpen?: boolean;
}

/**
 * Scroll-direction-aware hide for the fixed site chrome.
 *
 * Returns `{ hidden }`: true once the resident scrolls down past the chrome height,
 * false when they scroll up or sit near the top. Mobile-only (forces shown at >= md),
 * honours `prefers-reduced-motion`, and stays shown while the menu is open. State only
 * flips on a direction change, never per scroll frame.
 */
export function useHideOnScroll(options: UseHideOnScrollOptions = {}): { hidden: boolean } {
  const { scrollHide = true, isMenuOpen = false } = options;
  const [hidden, setHidden] = useState(false);
  const pathname = usePathname();

  const lastYRef = useRef(0);
  const menuOpenRef = useRef(isMenuOpen);
  menuOpenRef.current = isMenuOpen;

  // Menu open → pin shown.
  useEffect(() => {
    if (isMenuOpen) setHidden(false);
  }, [isMenuOpen]);

  // New page → reset baseline and show, so the next page never inherits a stale delta.
  useEffect(() => {
    lastYRef.current = typeof window !== 'undefined' ? Math.max(0, window.scrollY) : 0;
    setHidden(false);
  }, [pathname]);

  useEffect(() => {
    if (!scrollHide || typeof window === 'undefined') {
      setHidden(false);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotion.matches) {
      setHidden(false);
      return; // collapse disabled entirely for reduced-motion users
    }

    let ticking = false;
    lastYRef.current = Math.max(0, window.scrollY);

    const evaluate = () => {
      ticking = false;
      const y = Math.max(0, window.scrollY); // clamp iOS rubber-band negatives

      // Reduced-motion toggled on mid-session, or desktop width → always shown.
      if (reduceMotion.matches || window.innerWidth >= MD_BREAKPOINT_PX) {
        setHidden((h) => (h ? false : h));
        lastYRef.current = y;
        return;
      }

      const chromeHeight = getFixedSiteHeaderHeight(); // live-measured, banner-aware
      const delta = y - lastYRef.current;

      // Near the top → always shown.
      if (y <= chromeHeight) {
        setHidden((h) => (h ? false : h));
        lastYRef.current = y;
        return;
      }

      // Menu open → pinned shown.
      if (menuOpenRef.current) {
        lastYRef.current = y;
        return;
      }

      // Deadzone → ignore negligible movement (no state change, keep baseline).
      if (Math.abs(delta) < DEADZONE_PX) return;

      if (delta > 0) {
        setHidden((h) => (h ? h : true)); // scrolling down → hide
      } else {
        setHidden((h) => (h ? false : h)); // scrolling up → show
      }
      lastYRef.current = y;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(evaluate);
    };

    const onMotionChange = () => {
      if (reduceMotion.matches) setHidden(false);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    reduceMotion.addEventListener('change', onMotionChange);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      reduceMotion.removeEventListener('change', onMotionChange);
    };
  }, [scrollHide]);

  return { hidden };
}
