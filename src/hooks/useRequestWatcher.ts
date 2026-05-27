'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DETECTION } from '@/lib/cold-start/config';

/**
 * Mid-session stall watcher. Catches the case where the API was healthy at
 * page load (the primary /health probe passed) but a tracked API query goes
 * unhealthy later — e.g. a specific endpoint stalls, or the API genuinely
 * went down while the user is reading. Reports `true` once any single query
 * has been fetching for longer than the stall threshold (3.5s by default).
 *
 * The primary /health probe (in useColdStartDetection) handles initial load.
 * This watcher is the second safety net.
 */
export function useRequestWatcher(): boolean {
  const queryClient = useQueryClient();
  const [stalled, setStalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /** Per-queryHash timestamp of when we first saw the query enter the `fetching` state. */
    const firstSeenFetching = new Map<string, number>();

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      const q = event.query;
      if (q.state.fetchStatus === 'fetching') {
        if (!firstSeenFetching.has(q.queryHash)) {
          firstSeenFetching.set(q.queryHash, Date.now());
        }
      } else {
        firstSeenFetching.delete(q.queryHash);
      }
    });

    const evaluate = () => {
      const now = Date.now();
      let anyStalled = false;
      firstSeenFetching.forEach((seenAt) => {
        if (now - seenAt > DETECTION.stallThresholdMs) anyStalled = true;
      });
      setStalled((prev) => (prev === anyStalled ? prev : anyStalled));
    };

    const interval = setInterval(evaluate, 500);
    evaluate();

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [queryClient]);

  return stalled;
}
