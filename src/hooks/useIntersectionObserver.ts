'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook to observe element intersection with viewport.
 * Used for fade-up animations when elements enter view.
 */
export function useIntersectionObserver<T extends HTMLElement>(
  options: UseIntersectionObserverOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

/**
 * Hook to add fade-up animation class to multiple elements.
 * Observes all elements with the specified selector.
 */
export function useFadeUpObserver(selector: string = '.fade-up'): void {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [selector]);
}

/**
 * Hook for staggered reveal animations.
 * Returns a callback ref that applies stagger delay based on index.
 */
export function useStaggeredReveal(baseDelay: number = 800, staggerDelay: number = 100) {
  const elementsRef = useRef<(HTMLElement | null)[]>([]);

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    elementsRef.current[index] = el;
  }, []);

  useEffect(() => {
    elementsRef.current.forEach((el, index) => {
      if (!el) return;

      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';

      setTimeout(() => {
        el.style.transition = 'opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, baseDelay + index * staggerDelay);
    });
  }, [baseDelay, staggerDelay]);

  return setRef;
}
