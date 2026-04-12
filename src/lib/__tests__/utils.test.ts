import { afterEach, describe, expect, it, vi } from 'vitest';
import { formatDate, formatRelativeDate, cn, slugify } from '@/lib/utils';

describe('formatRelativeDate', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('compact mode uses short day/week/month labels', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-12T12:00:00Z'));

    expect(formatRelativeDate('2026-04-12T10:00:00Z', true)).toBe('Today');
    expect(formatRelativeDate('2026-04-11T10:00:00Z', true)).toBe('1d');
    expect(formatRelativeDate('2026-04-09T10:00:00Z', true)).toBe('3d');
    expect(formatRelativeDate('2026-03-15T10:00:00Z', true)).toBe('4w');
  });
});

describe('formatDate', () => {
  it('formats ISO date strings correctly', () => {
    expect(formatDate('2024-01-15')).toBe('15 January 2024');
  });

  it('handles different date formats', () => {
    expect(formatDate('2024-12-25')).toBe('25 December 2024');
  });
});

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4 py-2', 'bg-blue-500')).toBe('px-4 py-2 bg-blue-500');
  });

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional', false && 'hidden')).toBe('base conditional');
  });
});

describe('slugify', () => {
  it('converts text to URL-friendly slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(slugify('Test @#$% Page')).toBe('test-page');
  });

  it('handles multiple spaces', () => {
    expect(slugify('multi   spaces')).toBe('multi-spaces');
  });
});
