import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageLightbox from '../ImageLightbox';
import type { LightboxImage } from '@/types';

let capturedUnoptimized: boolean | undefined;
let capturedSrc: string | undefined;

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { unoptimized, src, alt, ...rest } = props;
    capturedUnoptimized = unoptimized as boolean | undefined;
    capturedSrc = src as string | undefined;
    return <img {...rest} alt={typeof alt === 'string' ? alt : ''} />;
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

  describe('the darkroom scrim', () => {
    it('dims to forest, never to black, and carries the page grain', () => {
      const { baseElement } = render(
        <ImageLightbox images={[mockLightboxImage()]} isOpen={true} onClose={() => {}} />
      );
      const scrim = baseElement.querySelector('.texture-grain');
      expect(scrim).not.toBeNull();
      // `bg-forest/92` and friends silently emit nothing: Tailwind's opacity
      // scale has no 92, so the class is dropped and the scrim renders fully
      // transparent. Pin the value that actually resolves.
      expect(scrim?.className).toContain('bg-forest/95');
      expect(baseElement.innerHTML).not.toContain('bg-black');
    });
  });

  describe('identity radius', () => {
    it('rounds on community surfaces', () => {
      render(
        <ImageLightbox images={[mockLightboxImage()]} isOpen={true} onClose={() => {}} />
      );
      expect(screen.getByLabelText('Close image viewer').className).toContain('rounded-md');
    });

    it('squares on management surfaces, per the dual radius doctrine', () => {
      render(
        <ImageLightbox
          images={[mockLightboxImage()]}
          isOpen={true}
          onClose={() => {}}
          identity="management"
        />
      );
      const close = screen.getByLabelText('Close image viewer');
      expect(close.className).toContain('rounded-none');
      expect(close.className).not.toContain('rounded-md');
    });
  });

  describe('caption bar', () => {
    it('prefers the editorial caption over the alt text', () => {
      render(
        <ImageLightbox
          images={[mockLightboxImage({ alt: 'Alt text', caption: 'Editorial line' })]}
          isOpen={true}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Editorial line')).toBeInTheDocument();
    });

    it('falls back to alt text for images that carry no caption', () => {
      render(
        <ImageLightbox
          images={[mockLightboxImage({ alt: 'Alt text', caption: undefined })]}
          isOpen={true}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Alt text')).toBeInTheDocument();
    });
  });
});