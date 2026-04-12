import { describe, it, expect } from 'vitest';
import { isNonOptimizableImageSrc } from '@/lib/image';

describe('isNonOptimizableImageSrc', () => {
  it('returns true for blob and data URLs', () => {
    expect(isNonOptimizableImageSrc('blob:http://localhost/x')).toBe(true);
    expect(isNonOptimizableImageSrc('data:image/png;base64,xx')).toBe(true);
  });

  it('returns false for http(s) and path URLs', () => {
    expect(isNonOptimizableImageSrc('https://example.com/a.jpg')).toBe(false);
    expect(isNonOptimizableImageSrc('/photos/a.jpg')).toBe(false);
  });
});
