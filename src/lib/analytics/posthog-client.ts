import posthog from 'posthog-js';
import { ANALYTICS_READY, POSTHOG_HOST, POSTHOG_KEY, TENANT } from './config';

let initialised = false;

export function initPostHog(): typeof posthog | null {
  if (typeof window === 'undefined') return null;
  if (!ANALYTICS_READY) return null;
  if (initialised) return posthog;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: 'https://us.posthog.com',
    autocapture: true,
    capture_pageview: 'history_change',
    capture_pageleave: true,
    persistence: 'localStorage+cookie',
    session_recording: {
      maskAllInputs: true,
    },
    loaded: (ph) => {
      ph.register({ tenant: TENANT });
    },
  });

  initialised = true;
  return posthog;
}

export function getPostHog(): typeof posthog | null {
  if (typeof window === 'undefined') return null;
  if (!initialised) return null;
  return posthog;
}
