'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Global scroll-to-top component that ensures pages start at the top.
 *
 * Next.js App Router doesn't automatically scroll to top on navigation.
 * This component listens for pathname changes and scrolls to the top
 * of the page, unless there's a hash in the URL (for anchor links).
 */
export function ScrollToTop() {
  const pathname = usePathname();
  const pathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip if there's a hash in the URL (for anchor links)
    if (window.location.hash) {
      return;
    }

    // Skip the map page (has its own scroll behavior)
    if (pathname === '/map') {
      return;
    }

    // On first mount, just record the current pathname (don't scroll yet)
    if (pathnameRef.current === null) {
      pathnameRef.current = pathname;
      return;
    }

    // On pathname change, scroll to top
    if (pathname !== pathnameRef.current) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant',
      });
      pathnameRef.current = pathname;
    }
  }, [pathname]);

  return null;
}
