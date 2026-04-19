import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatMemberSince } from '@/lib/format-member-since';

describe('formatMemberSince', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses week buckets for recent joins', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));

    expect(formatMemberSince('2026-04-13T10:00:00.000Z')).toBe('This week');
    expect(formatMemberSince('2026-04-10T10:00:00.000Z')).toBe('This week');
    expect(formatMemberSince('2026-04-06T10:00:00.000Z')).toBe('Two weeks ago');
    expect(formatMemberSince('2026-03-25T10:00:00.000Z')).toBe('Two weeks ago');
  });

  it('uses calendar month counts after three weeks', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));

    expect(formatMemberSince('2026-03-20T10:00:00.000Z')).toBe('1 month');
    expect(formatMemberSince('2026-02-10T10:00:00.000Z')).toBe('2 months');
  });

  it('uses year labels for long tenure', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T12:00:00.000Z'));

    expect(formatMemberSince('2025-04-01T10:00:00.000Z')).toBe('1 year');
    expect(formatMemberSince('2024-04-01T10:00:00.000Z')).toBe('2 years');
  });
});
