'use client';

import { useEffect, useState, useRef } from 'react';

interface UseParallaxOptions {
  speed?: number;
  maxScroll?: number;
}

/**
 * Hook to create parallax scroll effect.
 * Returns transform value to apply to background element.
 */
export function useParallax(options: UseParallaxOptions = {}): string {
  const { speed = 0.35, maxScroll } = options;
  const [transform, setTransform] = useState('translateY(0px)');

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const limit = maxScroll ?? window.innerHeight;

      if (scrolled < limit) {
        setTransform(`translateY(${scrolled * speed}px)`);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, maxScroll]);

  return transform;
}

/**
 * Parallax for a section anywhere in the document, not just at the top.
 *
 * `useHeroParallax` reads `window.scrollY`, which is the section's own travel
 * only while the section starts at the fold. For a band further down the page
 * the offset has to come from the section's own position in the viewport.
 *
 * The background element must overshoot its section on both sides — a wrapper
 * of `-top-[30%] h-[160%]` matches the default `overshoot` of 0.3 — so the
 * translated edges never come inside the section.
 */
export function useSectionParallax(overshoot: number = 0.3) {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const bgElement = bgRef.current;
    const sectionElement = sectionRef.current;
    if (!bgElement || !sectionElement) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = sectionElement.getBoundingClientRect();
      const viewport = window.innerHeight;
      const scrolled = window.scrollY;

      // The scroll positions where the section enters the bottom of the viewport
      // and where it leaves the top — both clamped to what the document can
      // actually scroll. The clamp matters: a band that sits at the end of the
      // page never finishes its crossing, so measuring against a full crossing
      // spends most of the drift on travel that cannot happen, and the effect
      // reads as static.
      const sectionTop = rect.top + scrolled;
      const maxScroll = Math.max(document.documentElement.scrollHeight - viewport, 0);
      const enter = Math.max(sectionTop - viewport, 0);
      const leave = Math.min(sectionTop + rect.height, maxScroll);
      const travel = leave - enter;
      if (travel <= 0) return;

      const progress = Math.min(Math.max((scrolled - enter) / travel, 0), 1);

      // Background lags the page: it sits high as the section arrives and
      // drifts down as the section leaves, so it reads as further away.
      const offset = (progress - 0.5) * 2 * rect.height * overshoot;
      bgElement.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    update();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [overshoot]);

  return { bgRef, sectionRef };
}

/**
 * Hook to get ref and transform for hero parallax background.
 * More optimized version using refs instead of state.
 */
export function useHeroParallax(speed: number = 0.35) {
  const bgRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const bgElement = bgRef.current;
    const heroElement = heroRef.current;
    if (!bgElement) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const heroHeight = heroElement?.offsetHeight ?? window.innerHeight;

      if (scrolled < heroHeight) {
        bgElement.style.transform = `translateY(${scrolled * speed}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed]);

  return { bgRef, heroRef };
}
