export const TENANT = 'cgrs' as const;

export const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true';
export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? '/ingest';

export const ANALYTICS_READY = ANALYTICS_ENABLED && POSTHOG_KEY.length > 0;
