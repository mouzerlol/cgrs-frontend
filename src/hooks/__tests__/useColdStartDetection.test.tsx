import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

vi.mock('@/lib/cold-start/health-ping', () => ({
  pingHealth: vi.fn(),
}));

vi.mock('@/lib/cold-start/config', async (importActual) => {
  const actual = await importActual<typeof import('@/lib/cold-start/config')>();
  return {
    ...actual,
    COLD_START_BANNER_ENABLED: true,
  };
});

import { pingHealth } from '@/lib/cold-start/health-ping';
import { useColdStartDetection } from '@/hooks/useColdStartDetection';

const mockedPing = vi.mocked(pingHealth);

/** Construct a deferred promise we can resolve mid-test. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('useColdStartDetection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedPing.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show banner when /health resolves within the 250ms grace window', async () => {
    // Resolve before the 250ms grace timer fires.
    const d = deferred<{ ok: boolean; durationMs: number }>();
    mockedPing.mockReturnValue(d.promise);

    const { result } = renderHook(() => useColdStartDetection());

    // Initially in grace, banner not visible yet.
    expect(result.current.shouldShowBanner).toBe(false);
    expect(result.current.phase).toBe('grace');

    // Resolve /health at 100ms (well inside the 250ms grace).
    await act(async () => {
      vi.advanceTimersByTime(100);
      d.resolve({ ok: true, durationMs: 100 });
      await Promise.resolve();
    });

    // Advance past the grace boundary; banner should never appear.
    await act(async () => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.shouldShowBanner).toBe(false);
    expect(result.current.phase).toBe('idle');
  });

  it('transitions to waiting after grace expires, then to resolved when /health responds', async () => {
    const d = deferred<{ ok: boolean; durationMs: number }>();
    mockedPing.mockReturnValue(d.promise);

    const { result } = renderHook(() => useColdStartDetection());

    // Cross the 250ms grace boundary.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.shouldShowBanner).toBe(true);
    expect(result.current.phase).toBe('waiting');

    // /health responds at 3s.
    await act(async () => {
      vi.advanceTimersByTime(2700);
      d.resolve({ ok: true, durationMs: 3000 });
      await Promise.resolve();
    });

    expect(result.current.phase).toBe('resolved');
    expect(result.current.shouldShowBanner).toBe(true); // resolution beat is still visible
  });

  it('transitions to prolonged at 10 seconds without a response', async () => {
    mockedPing.mockReturnValue(new Promise(() => {})); // never resolves

    const { result } = renderHook(() => useColdStartDetection());

    // Past grace into waiting.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.phase).toBe('waiting');

    // Past the 10s predicted wake duration (10s from waiting entry).
    await act(async () => {
      vi.advanceTimersByTime(10_100);
    });
    expect(result.current.phase).toBe('prolonged');
  });

  it('transitions to timedOut at 20 seconds without a response', async () => {
    mockedPing.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useColdStartDetection());

    await act(async () => {
      vi.advanceTimersByTime(300); // → waiting
      vi.advanceTimersByTime(20_100); // > 20s total elapsed since waiting entry
    });
    expect(result.current.phase).toBe('timedOut');
    expect(result.current.isTimedOut).toBe(true);
  });

  it('retry() from timedOut returns the hook to grace and re-pings /health', async () => {
    mockedPing.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useColdStartDetection());

    await act(async () => {
      vi.advanceTimersByTime(20_500);
    });
    expect(result.current.phase).toBe('timedOut');
    expect(mockedPing).toHaveBeenCalledTimes(1);

    await act(async () => {
      result.current.retry();
      await Promise.resolve();
    });
    expect(result.current.phase).toBe('grace');
    expect(mockedPing).toHaveBeenCalledTimes(2);
  });

  it('stays in idle when banner is disabled', async () => {
    const { result } = renderHook(() =>
      useColdStartDetection({ forceCold: true, disabled: true }),
    );
    expect(result.current.phase).toBe('idle');
    expect(result.current.shouldShowBanner).toBe(false);
    expect(mockedPing).not.toHaveBeenCalled();
  });

  it('stays in idle when explicitly disabled', async () => {
    const { result } = renderHook(() => useColdStartDetection({ disabled: true }));
    expect(result.current.phase).toBe('idle');
    expect(mockedPing).not.toHaveBeenCalled();
  });

  it('always probes /health on mount when enabled (covers daytime API-down case)', async () => {
    vi.setSystemTime(new Date('2026-07-15T02:00:00Z')); // 14:00 NZST — warm window
    const d = deferred<{ ok: boolean; durationMs: number }>();
    mockedPing.mockReturnValue(d.promise);

    const { result } = renderHook(() => useColdStartDetection());

    // Primary detector now runs regardless of clock; pingHealth fires immediately.
    expect(mockedPing).toHaveBeenCalledTimes(1);
    expect(result.current.phase).toBe('grace');

    // Grace expires without a /health response → banner shows.
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.phase).toBe('waiting');

    // Cleanup the deferred so the test exits cleanly.
    d.resolve({ ok: false, durationMs: 300 });
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('skips the /health probe when forceCold is true (design QA pin)', async () => {
    const { result } = renderHook(() => useColdStartDetection({ forceCold: true }));
    expect(result.current.phase).toBe('grace');
    // The probe is intentionally not fired — the banner is pinned open.
    expect(mockedPing).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.phase).toBe('waiting');
  });
});
