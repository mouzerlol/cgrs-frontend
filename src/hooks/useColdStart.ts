'use client';

import { useColdStartDetection, type ColdStartDetectionResult } from './useColdStartDetection';
import { useRequestWatcher } from './useRequestWatcher';

export interface UseColdStartOptions {
  /** Skip detection entirely (e.g. on excluded routes — management, petition, auth flows). */
  disabled?: boolean;
  /** Design/QA escape hatch: pin the banner open regardless of /health response. */
  forceCold?: boolean;
}

/**
 * Top-level cold-start orchestrator. Combines two detection signals:
 *  - Always-on /health probe (primary, via useColdStartDetection)
 *  - React-Query stall-watcher (catches mid-session stalls on real API calls
 *    that /health alone would miss — e.g. a slow specific endpoint while the
 *    server itself is up)
 *
 * Either signal can pin `forceCold` on; the primary hook owns the state
 * machine and banner lifecycle.
 */
export function useColdStart(opts: UseColdStartOptions = {}): ColdStartDetectionResult {
  const stalled = useRequestWatcher();
  return useColdStartDetection({
    forceCold: stalled || (opts.forceCold ?? false),
    disabled: opts.disabled,
  });
}
