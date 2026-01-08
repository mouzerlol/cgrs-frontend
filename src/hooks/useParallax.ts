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
