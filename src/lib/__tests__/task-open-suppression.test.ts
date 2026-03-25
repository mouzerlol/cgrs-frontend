import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { consumeTaskOpenSuppressionIfMatch, markTaskOpenSuppressionAfterDrag } from '../task-open-suppression';

describe('task-open-suppression', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('consumes matching task id and clears ref', () => {
    const ref = { current: null as string | null };
    markTaskOpenSuppressionAfterDrag(ref, 'task-1');
    expect(ref.current).toBe('task-1');
    expect(consumeTaskOpenSuppressionIfMatch(ref, 'task-1')).toBe(true);
    expect(ref.current).toBeNull();
  });

  it('does not consume non-matching id', () => {
    const ref = { current: null as string | null };
    markTaskOpenSuppressionAfterDrag(ref, 'task-1');
    expect(consumeTaskOpenSuppressionIfMatch(ref, 'task-2')).toBe(false);
    expect(ref.current).toBe('task-1');
  });

  it('clears suppression after timeout if no click', () => {
    const ref = { current: null as string | null };
    markTaskOpenSuppressionAfterDrag(ref, 'task-1', 400);
    vi.advanceTimersByTime(400);
    expect(ref.current).toBeNull();
    expect(consumeTaskOpenSuppressionIfMatch(ref, 'task-1')).toBe(false);
  });
});
