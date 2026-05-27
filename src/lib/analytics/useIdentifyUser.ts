'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { TENANT } from './config';
import { getPostHog } from './posthog-client';
import { track } from './events';

const FRESH_SIGNUP_WINDOW_MS = 5 * 60 * 1000;
const SESSION_KEY_PREFIX = 'cgrs-analytics-identified:';

export function useIdentifyUser() {
  const { isLoaded, isSignedIn, user } = useUser();
  const lastIdentifiedId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;
    const ph = getPostHog();
    if (!ph) return;

    if (isSignedIn && user) {
      if (lastIdentifiedId.current === user.id) return;

      ph.identify(user.id, {
        tenant: TENANT,
        signup_at: user.createdAt?.toISOString() ?? null,
      });
      lastIdentifiedId.current = user.id;

      const sessionKey = `${SESSION_KEY_PREFIX}${user.id}`;
      const alreadyTrackedThisSession =
        typeof window !== 'undefined' &&
        window.sessionStorage.getItem(sessionKey) === '1';

      if (!alreadyTrackedThisSession) {
        const createdMs = user.createdAt?.getTime() ?? 0;
        const isFreshSignup =
          createdMs > 0 && Date.now() - createdMs < FRESH_SIGNUP_WINDOW_MS;

        if (isFreshSignup) {
          track('account_signed_up', { tenant: TENANT });
        } else {
          track('account_signed_in', { tenant: TENANT });
        }

        try {
          window.sessionStorage.setItem(sessionKey, '1');
        } catch {
          // sessionStorage unavailable (privacy mode) — silently ignore.
        }
      }
    } else if (lastIdentifiedId.current !== null) {
      ph.reset();
      lastIdentifiedId.current = null;
    }
  }, [isLoaded, isSignedIn, user]);
}
