'use client';

import { useEffect, useState } from 'react';

/**
 * Subscribe to the `prefers-reduced-motion` media query.
 * Returns false during SSR (we cannot know the user's preference), then
 * settles to the real value on mount and stays in sync with changes.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return reduced;
}
