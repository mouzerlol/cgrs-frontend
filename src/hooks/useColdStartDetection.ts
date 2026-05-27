'use client';

import { useEffect, useReducer, useRef, useCallback } from 'react';
import { DETECTION, COLD_START_BANNER_ENABLED } from '@/lib/cold-start/config';
import { pingHealth } from '@/lib/cold-start/health-ping';

export type ColdStartPhase =
  /** Detection running but banner not yet visible (within the 250ms grace). */
  | 'grace'
  /** Banner visible, server hasn't responded yet. */
  | 'waiting'
  /** Predicted 10s has passed without response; softer copy. */
  | 'prolonged'
  /** Hard timeout; recoverable error state. */
  | 'timedOut'
  /** Server responded; banner plays the resolution beat and exits. */
  | 'resolved'
  /** No banner ever — server was warm or banner not applicable. */
  | 'idle';

export interface ColdStartDetectionResult {
  /** Banner is rendered when this is true. */
  shouldShowBanner: boolean;
  /** Phase the banner should render at. */
  phase: ColdStartPhase;
  /** Server-side detection state from the hook's reducer (for tests + edge components). */
  isResolved: boolean;
  isTimedOut: boolean;
  /** UTC timestamp of banner mount, used to compute the sunrise stripe progress. */
  startedAt: number | null;
  /** Re-fires the /health probe and resets timers (from the error state's retry action). */
  retry: () => void;
}

type DetectionState = {
  phase: ColdStartPhase;
  startedAt: number | null;
};

type DetectionAction =
  | { type: 'init'; phase: ColdStartPhase; startedAt: number | null }
  | { type: 'enterWaiting'; at: number }
  | { type: 'enterProlonged' }
  | { type: 'enterTimedOut' }
  | { type: 'resolve' }
  | { type: 'dismiss' }
  | { type: 'reset' };

function reduce(state: DetectionState, action: DetectionAction): DetectionState {
  switch (action.type) {
    case 'init':
      return { phase: action.phase, startedAt: action.startedAt };
    case 'enterWaiting':
      // Only valid out of grace.
      if (state.phase !== 'grace') return state;
      return { phase: 'waiting', startedAt: action.at };
    case 'enterProlonged':
      if (state.phase !== 'waiting') return state;
      return { ...state, phase: 'prolonged' };
    case 'enterTimedOut':
      if (state.phase !== 'waiting' && state.phase !== 'prolonged') return state;
      return { ...state, phase: 'timedOut' };
    case 'resolve':
      // Resolution beat plays out of waiting / prolonged / timedOut. From grace we go straight to idle.
      if (state.phase === 'idle' || state.phase === 'resolved') return state;
      if (state.phase === 'grace') return { phase: 'idle', startedAt: null };
      return { ...state, phase: 'resolved' };
    case 'dismiss':
      return { phase: 'idle', startedAt: null };
    case 'reset':
      return { phase: 'grace', startedAt: null };
    default:
      return state;
  }
}

export interface UseColdStartDetectionOptions {
  /**
   * Force the banner state machine to engage even when /health would otherwise
   * be skipped (e.g., URL `?_cs=force` for design QA). When true the hook acts
   * as if the API is cold; if /health resolves promptly, the banner still
   * never flashes thanks to the 250ms grace timer.
   */
  forceCold?: boolean;
  /** Skip detection entirely (e.g. on excluded routes). */
  disabled?: boolean;
}

/**
 * Decide whether the cold-start banner should be shown, and which phase to render.
 *
 * Detection model (always-on probe):
 *  - On mount (when enabled and not disabled), enter `grace` and ping /health.
 *  - /health resolves within 250ms → drop straight to `idle` (banner never appears).
 *  - /health does not resolve / fails by 250ms → enter `waiting`, banner appears.
 *  - 10s elapsed in `waiting` without success → `prolonged` (softer copy).
 *  - 20s elapsed → `timedOut` (recoverable error state).
 *  - /health resolves from any visible phase → `resolved` (resolution beat).
 *
 * The probe runs regardless of clock time. The 250ms grace guarantees that a
 * warm-server visit never shows a banner — the cost is one cheap GET /health
 * per page load. This is intentional after design.md D1 was revised: the
 * previous sleep-window-only probe missed the case where the API is genuinely
 * unreachable outside the sleep window (e.g., container off in local dev, or
 * a scheduler failure during the day).
 *
 * `forceCold` is kept as an escape hatch for design QA (`?_cs=force`).
 */
export function useColdStartDetection(
  opts: UseColdStartDetectionOptions = {},
): ColdStartDetectionResult {
  const initial: DetectionState =
    !COLD_START_BANNER_ENABLED || opts.disabled
      ? { phase: 'idle', startedAt: null }
      : { phase: 'grace', startedAt: null };

  const [state, dispatch] = useReducer(reduce, initial);
  const abortRef = useRef<AbortController | null>(null);
  const graceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prolongedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timedOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
    if (prolongedTimerRef.current) clearTimeout(prolongedTimerRef.current);
    if (timedOutTimerRef.current) clearTimeout(timedOutTimerRef.current);
    graceTimerRef.current = null;
    prolongedTimerRef.current = null;
    timedOutTimerRef.current = null;
  }, []);

  const startDetection = useCallback(
    (skipProbe: boolean) => {
      clearTimers();
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      let healthResolved = false;
      let exitedGrace = false;

      // Fire the probe, unless we have been told to pin the banner open
      // (forceCold — used by the ?_cs=force URL param for design QA).
      if (!skipProbe) {
        void pingHealth(ctrl.signal).then((result) => {
          healthResolved = result.ok;
          if (!result.ok) return;
          if (!exitedGrace) {
            // Resolved within grace — drop straight to idle.
            dispatch({ type: 'resolve' });
            return;
          }
          // Resolved after we already showed the banner — play resolution beat.
          dispatch({ type: 'resolve' });
        });
      }

      // Grace timer: at 250ms, if /health hasn't resolved, escalate to waiting.
      graceTimerRef.current = setTimeout(() => {
        exitedGrace = true;
        if (healthResolved) return;
        dispatch({ type: 'enterWaiting', at: Date.now() });

        // Prolonged timer: 10s from now (predicted wake duration).
        prolongedTimerRef.current = setTimeout(() => {
          if (healthResolved) return;
          dispatch({ type: 'enterProlonged' });
        }, DETECTION.predictedWakeMs);

        // Hard timeout: 20s from now.
        timedOutTimerRef.current = setTimeout(() => {
          if (healthResolved) return;
          dispatch({ type: 'enterTimedOut' });
        }, DETECTION.hardTimeoutMs);
      }, DETECTION.graceMs);
    },
    [clearTimers],
  );

  // Kick off a detection cycle whenever the hook enters (or re-enters) grace.
  // We deliberately do not return a cleanup here, because the cycle's timers
  // need to survive the grace → waiting transition. Teardown happens in the
  // unmount-only effect below.
  useEffect(() => {
    if (state.phase !== 'grace') return;
    startDetection(opts.forceCold ?? false);
  }, [state.phase, startDetection, opts.forceCold]);

  // Once the resolution beat has played, dismiss the banner so the real nav can re-mount.
  useEffect(() => {
    if (state.phase !== 'resolved') return;
    const dismissAfter = DETECTION.resolutionCompleteMs + DETECTION.resolutionHoldMs;
    const id = setTimeout(() => dispatch({ type: 'dismiss' }), dismissAfter);
    return () => clearTimeout(id);
  }, [state.phase]);

  // Unmount-only cleanup: aborts in-flight pings and clears any live timers.
  useEffect(() => {
    return () => {
      clearTimers();
      abortRef.current?.abort();
    };
  }, [clearTimers]);

  const retry = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

  return {
    shouldShowBanner:
      state.phase === 'waiting' ||
      state.phase === 'prolonged' ||
      state.phase === 'timedOut' ||
      state.phase === 'resolved',
    phase: state.phase,
    isResolved: state.phase === 'resolved',
    isTimedOut: state.phase === 'timedOut',
    startedAt: state.startedAt,
    retry,
  };
}
