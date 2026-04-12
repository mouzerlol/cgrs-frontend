import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageGallery from '../ImageGallery';
import type { ThreadImage } from '@/types';

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill: _f, sizes: _s, unoptimized: _u, ...rest } = props;
    return <img data-testid="next-image" alt="" {...rest} />;
  },
}));

vi.mock('@/components/ui/ImageLightbox', () => ({
  default: function MockLightbox() {
    return null;
  },
}));

function mockImage(overrides: Partial<ThreadImage> = {}): ThreadImage {
  return {
    id: 'img-1',
    thumbnail: 'https://example.com/thumb.jpg',
    url: 'https://example.com/full.jpg',
    alt: 'Test',
    ...overrides,
  };
}

describe('ImageGallery', () => {
  it('centers the gallery row so a single image is not left-aligned in the thread', () => {
    const { container } = render(<ImageGallery images={[mockImage()]} />);
    const row = container.firstElementChild;
    expect(row).toBeTruthy();
    expect(row).toHaveClass('justify-center');
  });

  it('uses centered object-fit focal point on thumbnails', () => {
    render(<ImageGallery images={[mockImage()]} />);
    const img = screen.getByTestId('next-image');
    expect(img).toHaveClass('object-center');
  });
});
