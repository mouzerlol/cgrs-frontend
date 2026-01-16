'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * Hook for scroll behavior - positions content below fixed nav on user interaction.
 */
export function useImmersiveScroll(
  sectionRef: React.RefObject<HTMLElement | null>,
  options: {
    scrollOnMount?: boolean;
    scrollUpThreshold?: number;
  } = {}
) {
  const { scrollOnMount = false, scrollUpThreshold = 50 } = options;
  const hasScrolledRef = useRef(false);
  const ignoreScrollRef = useRef(false);
  const lastScrollRef = useRef(0);

  const enterImmersive = useCallback(() => {
    if (hasScrolledRef.current || !sectionRef.current) return;

    hasScrolledRef.current = true;
    ignoreScrollRef.current = true;

    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const navHeight = 64;
    const targetY = rect.top + scrollTop - navHeight;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });

    setTimeout(() => {
      ignoreScrollRef.current = false;
    }, 600);
  }, [sectionRef]);

  const exitImmersive = useCallback(() => {
    hasScrolledRef.current = false;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (ignoreScrollRef.current) {
        lastScrollRef.current = window.pageYOffset;
        return;
      }

      const currentScrollY = window.pageYOffset;

      if (!hasScrolledRef.current) {
        lastScrollRef.current = currentScrollY;
        return;
      }

      if (currentScrollY < lastScrollRef.current - scrollUpThreshold) {
        exitImmersive();
      }

      lastScrollRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [exitImmersive, scrollUpThreshold]);

  useEffect(() => {
    if (scrollOnMount) {
      enterImmersive();
    }
  }, [scrollOnMount, enterImmersive]);

  return {
    enterImmersive,
    exitImmersive,
    hasScrolled: hasScrolledRef.current,
  };
}
