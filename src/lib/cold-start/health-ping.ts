import { getApiUrl } from '@/lib/api/api-url';

export interface HealthPingResult {
  /** Whether the /health request resolved successfully. */
  ok: boolean;
  /** Milliseconds elapsed from the call to the result. */
  durationMs: number;
}

/**
 * Lightweight unauthenticated probe of the API's /health endpoint. Used as the
 * cold-start banner's wake-up signal. Intentionally NOT a React Query — the
 * banner needs to know the response time, not the cached value.
 *
 * Aborts if `signal` is aborted (e.g. component unmount or retry-from-error).
 */
export async function pingHealth(signal?: AbortSignal): Promise<HealthPingResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${getApiUrl()}/health`, {
      method: 'GET',
      cache: 'no-store',
      signal,
    });
    return { ok: res.ok, durationMs: performance.now() - start };
  } catch {
    return { ok: false, durationMs: performance.now() - start };
  }
}
