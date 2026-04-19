import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ImageLightbox from '../ImageLightbox';
import type { LightboxImage } from '@/types';

let capturedUnoptimized: boolean | undefined;
let capturedSrc: string | undefined;

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { unoptimized, src, ...rest } = props;
    capturedUnoptimized = unoptimized as boolean | undefined;
    capturedSrc = src as string | undefined;
    return <img {...rest} />;
  },
}));

function mockLightboxImage(overrides: Partial<LightboxImage> = {}): LightboxImage {
  return {
    id: 'img-1',
    thumbnail: 'https://example.com/thumb.jpg',
    url: 'https://example.com/full.jpg',
    alt: 'Test',
    ...overrides,
  };
}

describe('ImageLightbox', () => {
  beforeEach(() => {
    capturedUnoptimized = undefined;
    capturedSrc = undefined;
  });

  describe('unoptimized prop for next/image', () => {
    it('sets unoptimized=true for blob URL in main image', () => {
      render(
        <ImageLightbox
          images={[mockLightboxImage({ url: 'blob:http://localhost/blob123' })]}
          isOpen={true}
          onClose={() => {}}
        />
      );
      expect(capturedSrc).toBe('blob:http://localhost/blob123');
      expect(capturedUnoptimized).toBe(true);
    });

    it('sets unoptimized=false for regular URL in main image', () => {
      render(
        <ImageLightbox
          images={[mockLightboxImage({ url: 'https://example.com/full.jpg' })]}
          isOpen={true}
          onClose={() => {}}
        />
      );
      expect(capturedSrc).toBe('https://example.com/full.jpg');
      expect(capturedUnoptimized).toBe(false);
    });
  });
});