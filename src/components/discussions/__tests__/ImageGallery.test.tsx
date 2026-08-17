import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageGallery from '../ImageGallery';
import type { ThreadImage } from '@/types';

// Shared variable to capture unoptimized prop across mock instances
let capturedUnoptimized: boolean | undefined;

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill: _f, sizes: _s, unoptimized, ...rest } = props;
    capturedUnoptimized = unoptimized as boolean | undefined;
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
  beforeEach(() => {
    capturedUnoptimized = undefined;
  });

  it('hangs the pictures in a square, full-width dark field', () => {
    const { container } = render(<ImageGallery images={[mockImage()]} />);
    const field = container.firstElementChild;
    expect(field).toBeTruthy();
    expect(field).toHaveClass('bg-forest', 'w-full', 'rounded-none');
  });

  it('centers the gallery row so a single image is not left-aligned in the thread', () => {
    const { container } = render(<ImageGallery images={[mockImage()]} />);
    const row = container.firstElementChild?.firstElementChild;
    expect(row).toBeTruthy();
    expect(row).toHaveClass('justify-center');
  });

  it('rounds the picture itself and never crops it', () => {
    render(<ImageGallery images={[mockImage()]} />);
    const img = screen.getByTestId('next-image');
    expect(img).toHaveClass('rounded-lg');
    expect(img.className).not.toMatch(/object-cover/);
  });

  /* The affordance carried across from the article figure: without it nothing
     says the picture opens. */
  it('marks each picture as expandable', () => {
    render(<ImageGallery images={[mockImage(), mockImage({ id: 'img-2' })]} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => {
      expect(button).toHaveAccessibleName(/full size/i);
      expect(button.querySelector('svg')).toBeTruthy();
    });
  });

  /* A lone picture is served from `url` (full size, it gets the whole field);
     a set is served from `thumbnail`. Both paths must still opt blob previews
     out of the optimizer. */
  it('sets unoptimized=true for a blob URL on a single image', () => {
    render(<ImageGallery images={[mockImage({ url: 'blob:http://localhost/abc123' })]} />);
    expect(capturedUnoptimized).toBe(true);
  });

  it('sets unoptimized=true for blob URL thumbnails in a set', () => {
    render(
      <ImageGallery
        images={[
          mockImage({ thumbnail: 'blob:http://localhost/abc123' }),
          mockImage({ id: 'img-2', thumbnail: 'blob:http://localhost/def456' }),
        ]}
      />,
    );
    expect(capturedUnoptimized).toBe(true);
  });

  it('sets unoptimized=false for regular URLs', () => {
    render(<ImageGallery images={[mockImage()]} />);
    expect(capturedUnoptimized).toBe(false);
  });
});
