import { describe, expect, it } from 'vitest';
import { aucklandHour, isInSleepWindow } from '@/lib/cold-start/sleep-window';

/**
 * Helpers to construct UTC instants that we then evaluate against Auckland time.
 * Auckland is UTC+12 (NZST) or UTC+13 (NZDT). We assert against the resolved
 * Auckland hour rather than the UTC hour, which is the whole point.
 */
function utc(iso: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) throw new Error(`Bad ISO: ${iso}`);
  return d;
}

describe('aucklandHour', () => {
  it('returns 14 NZDT for 01:00 UTC during NZ summer time', () => {
    // 2026-01-15 — NZ in NZDT (UTC+13). 01:00 UTC = 14:00 NZDT.
    expect(aucklandHour(utc('2026-01-15T01:00:00Z'))).toBe(14);
  });

  it('returns 14 NZST for 02:00 UTC during NZ standard time', () => {
    // 2026-07-15 — NZ in NZST (UTC+12). 02:00 UTC = 14:00 NZST.
    expect(aucklandHour(utc('2026-07-15T02:00:00Z'))).toBe(14);
  });

  it('returns 0 for midnight Auckland (not 24)', () => {
    // 2026-07-14 12:00 UTC = 2026-07-15 00:00 NZST.
    expect(aucklandHour(utc('2026-07-14T12:00:00Z'))).toBe(0);
  });
});

describe('isInSleepWindow', () => {
  it('returns true at 02:00 NZ (deep inside sleep window)', () => {
    // 2026-07-14 14:00 UTC = 2026-07-15 02:00 NZST.
    expect(isInSleepWindow(utc('2026-07-14T14:00:00Z'))).toBe(true);
  });

  it('returns true exactly at 23:00 NZ (start edge, inclusive)', () => {
    // 2026-07-15 11:00 UTC = 2026-07-15 23:00 NZST.
    expect(isInSleepWindow(utc('2026-07-15T11:00:00Z'))).toBe(true);
  });

  it('returns false exactly at 06:00 NZ (end edge, exclusive)', () => {
    // 2026-07-14 18:00 UTC = 2026-07-15 06:00 NZST.
    expect(isInSleepWindow(utc('2026-07-14T18:00:00Z'))).toBe(false);
  });

  it('returns false at 14:00 NZ (deep inside warm window)', () => {
    expect(isInSleepWindow(utc('2026-07-15T02:00:00Z'))).toBe(false);
  });

  it('correctly classifies a Sydney clock at 23:30 AEDT (NZ is 01:30 NZDT — sleep window)', () => {
    // 2026-01-15 12:30 UTC = 2026-01-15 23:30 AEDT = 2026-01-16 01:30 NZDT.
    // We expect TRUE because we evaluate in Auckland time, not Sydney.
    expect(isInSleepWindow(utc('2026-01-15T12:30:00Z'))).toBe(true);
  });

  it('correctly classifies a Sydney clock at 13:30 AEDT (NZ is 15:30 NZDT — warm window)', () => {
    // 2026-01-15 02:30 UTC = 2026-01-15 13:30 AEDT = 2026-01-15 15:30 NZDT.
    expect(isInSleepWindow(utc('2026-01-15T02:30:00Z'))).toBe(false);
  });

  it('handles DST transitions cleanly (NZDT → NZST at 03:00 NZ on first Sunday of April)', () => {
    // 2026-04-05 02:00 NZDT = 2026-04-04 13:00 UTC. Sleep window: yes.
    expect(isInSleepWindow(utc('2026-04-04T13:00:00Z'))).toBe(true);
    // 2026-04-05 14:00 NZST = 2026-04-05 02:00 UTC. Warm window: no.
    expect(isInSleepWindow(utc('2026-04-05T02:00:00Z'))).toBe(false);
  });
});
