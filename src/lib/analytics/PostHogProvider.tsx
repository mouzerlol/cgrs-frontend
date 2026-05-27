'use client';

import { ReactNode, useEffect } from 'react';
import { ANALYTICS_READY } from './config';
import { initPostHog } from './posthog-client';
import { useIdentifyUser } from './useIdentifyUser';

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!ANALYTICS_READY) return;

    const idle =
      typeof window !== 'undefined' && 'requestIdleCallback' in window
        ? (cb: () => void) =>
            window.requestIdleCallback(cb, { timeout: 1500 })
        : (cb: () => void) => window.setTimeout(cb, 1500);

    const handle = idle(() => {
      initPostHog();
    });

    return () => {
      if (
        typeof window !== 'undefined' &&
        'cancelIdleCallback' in window &&
        typeof handle === 'number'
      ) {
        window.cancelIdleCallback(handle);
      } else if (typeof handle === 'number') {
        window.clearTimeout(handle);
      }
    };
  }, []);

  useIdentifyUser();

  return <>{children}</>;
}
