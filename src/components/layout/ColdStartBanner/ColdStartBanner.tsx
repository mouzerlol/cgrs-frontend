'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { DETECTION } from '@/lib/cold-start/config';
import { formatBannerMetadata } from '@/lib/cold-start/format-metadata';
import type { ColdStartPhase } from '@/hooks/useColdStartDetection';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useTypeIn } from '@/hooks/useTypeIn';

const COPY = {
  waiting: 'Our server is waking up. About 10 seconds.',
  prolonged: 'Still waking. Sometimes this takes a moment longer.',
  timedOut: "Our server isn't waking up.",
  resolved: 'Awake. Good morning.',
} as const;

const SR_ANNOUNCEMENTS = {
  waiting: 'Our server is waking up. About ten seconds. Link: why this happens.',
  timedOut: "Our server isn't waking up. Retry or let us know.",
  resolved: 'The server is awake. Navigation is now available.',
} as const;

export interface ColdStartBannerProps {
  phase: ColdStartPhase;
  /** Called when the user activates "Try again" from the timed-out state. */
  onRetry: () => void;
  /** Optional override for the metadata date — useful for visual snapshots. */
  now?: Date;
}

export default function ColdStartBanner({ phase, onRetry, now }: ColdStartBannerProps) {
  const reduced = usePrefersReducedMotion();
  const metadata = useMemo(() => formatBannerMetadata(now), [now]);

  // The prose that should be visible right now, by phase.
  const targetProse =
    phase === 'prolonged'
      ? COPY.prolonged
      : phase === 'timedOut'
        ? COPY.timedOut
        : phase === 'resolved'
          ? COPY.resolved
          : COPY.waiting;

  // Only the initial waiting state plays the slow-letter type-in. Other phases swap copy instantly.
  const shouldTypeIn = phase === 'waiting' && !reduced;
  const { text: typedText, isComplete: typeInDone } = useTypeIn(
    targetProse,
    DETECTION.typeInPerCharMs,
    !shouldTypeIn,
  );

  return (
    <div
      className="flex-1 relative min-w-0 flex items-center justify-end"
      data-cold-start-banner
      data-phase={phase}
    >
      {/* Sunrise stripe — runs along the top edge of the banner slot. */}
      <SunriseStripe phase={phase} reduced={reduced} />

      <div className="flex-1 min-w-0 flex flex-col justify-center leading-tight pl-2 md:pl-4">
        <div className="font-mono text-[0.6875rem] uppercase tracking-wider text-bone/70 whitespace-nowrap overflow-hidden text-ellipsis">
          NO. {metadata.entryNo} · {metadata.weekday} {metadata.hhmm} {metadata.zoneLabel}
          <span className="hidden md:inline"> · {metadata.place}</span>
        </div>

        <div className="flex items-baseline justify-between gap-4 mt-0.5">
          <span
            className="font-display text-bone text-[0.95rem] md:text-base whitespace-nowrap overflow-hidden text-ellipsis"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {typedText}
            {shouldTypeIn && !typeInDone && (
              <span aria-hidden className="inline-block ml-0.5 animate-pulse">_</span>
            )}
          </span>

          <BannerActions phase={phase} onRetry={onRetry} />
        </div>
      </div>

      {/* Off-screen extra announcement for the one-shot SR messages that aria-live doesn't naturally re-fire. */}
      <SrAnnouncer phase={phase} />
    </div>
  );
}

/** The 1px terracotta horizon at the top edge of the banner. */
function SunriseStripe({ phase, reduced }: { phase: ColdStartPhase; reduced: boolean }) {
  const isActive =
    phase === 'waiting' ||
    phase === 'prolonged' ||
    phase === 'timedOut' ||
    phase === 'resolved';

  // Translate the phase to (transform, transition, color, opacity).
  const colorClass =
    phase === 'timedOut' ? 'bg-amber' : phase === 'prolonged' ? 'bg-sage' : 'bg-terracotta';

  const opacity = phase === 'prolonged' ? 0.5 : reduced && phase === 'waiting' ? 0.3 : 1;

  const transition = reduced
    ? 'none'
    : phase === 'resolved'
      ? `transform ${DETECTION.resolutionCompleteMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
      : phase === 'waiting'
        ? `transform ${DETECTION.predictedWakeMs}ms linear`
        : 'transform 0ms';

  const transform = isActive || reduced ? 'scaleX(1)' : 'scaleX(0)';

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -top-px left-0 right-0 h-px overflow-hidden"
    >
      <div
        className={`h-px ${colorClass} origin-left will-change-transform`}
        style={{ transform, transition, opacity }}
      />
    </div>
  );
}

/** Right-aligned action cluster: "Why? →" or "Try again" / "Let us know" depending on phase. */
function BannerActions({ phase, onRetry }: { phase: ColdStartPhase; onRetry: () => void }) {
  const whyRef = useRef<HTMLAnchorElement>(null);

  // On first render with a visible link, if focus was lost when Navigation
  // unmounted (activeElement is body), move focus to the Why link so keyboard
  // users have somewhere meaningful to be. Never steal focus from a form, input,
  // or any other element the user has already engaged with.
  useEffect(() => {
    if (phase !== 'waiting') return;
    if (typeof document === 'undefined') return;
    const active = document.activeElement;
    if (active === null || active === document.body) {
      whyRef.current?.focus({ preventScroll: true });
    }
    // We only attempt this once on the first waiting render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'resolved') return null;

  if (phase === 'timedOut') {
    return (
      <div className="flex items-center gap-3 shrink-0 text-xs md:text-sm">
        <button
          type="button"
          onClick={onRetry}
          className="text-bone underline underline-offset-4 decoration-amber/60 hover:decoration-amber transition-colors"
        >
          Try again
        </button>
        <Link
          href="/sustainability"
          className="text-bone/70 hover:text-bone transition-colors"
        >
          Let us know →
        </Link>
      </div>
    );
  }

  return (
    <Link
      ref={whyRef}
      href="/sustainability"
      className="shrink-0 text-xs md:text-sm text-bone/80 hover:text-terracotta transition-colors underline underline-offset-4 decoration-bone/30 hover:decoration-terracotta whitespace-nowrap"
    >
      Why? →
    </Link>
  );
}

/**
 * Re-announces messages that the persistent aria-live region above does not
 * naturally repeat (resolution beat, error state). Uses a separate atomic
 * region so the announcement fires exactly once per phase entry.
 */
function SrAnnouncer({ phase }: { phase: ColdStartPhase }) {
  const [message, setMessage] = useState('');
  const announcedPhases = useRef<Set<ColdStartPhase>>(new Set());

  useEffect(() => {
    const map: Partial<Record<ColdStartPhase, string>> = {
      waiting: SR_ANNOUNCEMENTS.waiting,
      timedOut: SR_ANNOUNCEMENTS.timedOut,
      resolved: SR_ANNOUNCEMENTS.resolved,
    };
    const next = map[phase];
    if (!next) return;
    if (announcedPhases.current.has(phase)) return;
    announcedPhases.current.add(phase);
    setMessage(next);
    // Clear the message after a tick so the live region can re-fire if the same phase is re-entered (retry).
    const id = setTimeout(() => setMessage(''), 1500);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
