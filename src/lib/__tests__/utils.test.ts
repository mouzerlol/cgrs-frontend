import { describe, it, expect } from 'vitest';
import { formatDate, cn, slugify } from '@/lib/utils';

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
