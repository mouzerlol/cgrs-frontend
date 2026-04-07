/**
 * Cache staleness tiers for React Query.
 *
 * Values are aligned with backend TTL constants in
 * cgrs-api/core/cache_constants.py so that backend Redis TTL <= frontend
 * staleTime, preventing freshness inversion (frontend refetch hitting a
 * stale Redis cache).
 */
export const STALE_TIMES = {
  /** 30s — High-velocity collaborative data (tasks) */
  REALTIME: 30 * 1000,
  /** 1 min — Frequently updated by user action (management requests) */
  FREQUENT: 60 * 1000,
  /** 2 min — User-driven state (verification, presigned URLs) */
  SHORT: 2 * 60 * 1000,
  /** 5 min — Standard content (threads, replies, user data) — matches global default */
  CONTENT: 5 * 60 * 1000,
  /** 10 min — Slowly changing reference (streets) */
  SLOW: 10 * 60 * 1000,
  /** 15 min — Aggregate statistics */
  STATS: 15 * 60 * 1000,
  /** 1 hour — Near-static reference data (categories, settings, gamification) */
  REFERENCE: 60 * 60 * 1000,
} as const;
