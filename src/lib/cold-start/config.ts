/**
 * Sleep-window config for the cold-start banner.
 *
 * The source of truth is `cgrs-iac/environments/<env>/<env>.tfvars`
 * (`cloud_run_scale_up_cron`, `cloud_run_scale_down_cron`). At build time the
 * frontend takes the same two hour values via `NEXT_PUBLIC_*` env vars so that
 * the banner's detection logic and the IaC scheduler cannot drift silently.
 *
 * The values are HOURS in Pacific/Auckland time. The sleep window is the
 * interval [endHour, startHour) — i.e. from the scale-DOWN hour at the end of
 * the day to the scale-UP hour the next morning. We evaluate this in Auckland
 * time always (see sleep-window.ts).
 */

export interface SleepWindowConfig {
  /** Hour at which the API scales DOWN to zero (default 23 = 11pm NZ). */
  startHour: number;
  /** Hour at which the API scales UP to one (default 6 = 6am NZ). */
  endHour: number;
}

function readHourEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 23) return fallback;
  return parsed;
}

/** Resolve sleep-window hours from env at module load. Safe in both server and client bundles. */
export const SLEEP_WINDOW: SleepWindowConfig = {
  startHour: readHourEnv('NEXT_PUBLIC_SLEEP_WINDOW_START_HOUR', 23),
  endHour: readHourEnv('NEXT_PUBLIC_SLEEP_WINDOW_END_HOUR', 6),
};

/** Static feature-flag for the banner. Static rather than API-driven because the API is what we are gating on. */
export const COLD_START_BANNER_ENABLED =
  process.env.NEXT_PUBLIC_COLD_START_BANNER_ENABLED === 'true';

/** Detection timings. Kept here so tests can read the same source of truth. */
export const DETECTION = {
  /** Render-grace window: if /health resolves within this, the banner never appears. */
  graceMs: 250,
  /** Threshold for the request-watcher (outside sleep window). */
  stallThresholdMs: 3_500,
  /** Predicted wake duration; drives the sunrise stripe and prolonged-wait transition. */
  predictedWakeMs: 10_000,
  /** Hard timeout to the error state. */
  hardTimeoutMs: 20_000,
  /** Resolution-beat hold before the banner fades out. */
  resolutionHoldMs: 600,
  /** Rapid stripe-completion when /health resolves mid-animation. */
  resolutionCompleteMs: 300,
  /** Per-character type-in pace for the slow-letter. */
  typeInPerCharMs: 40,
} as const;
