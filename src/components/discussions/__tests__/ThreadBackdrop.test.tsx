import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadBackdrop, { THREAD_BACKDROP_IMAGE } from '../ThreadBackdrop';

vi.mock('next/image', () => ({
  // fill/priority/sizes are next/image props, not DOM attributes — drop them so React
  // does not warn about non-boolean attributes on every render.
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img data-testid="backdrop-image" src={src} alt={alt} className={className} />
  ),
}));

describe('ThreadBackdrop', () => {
  it('sizes to its content plus padding rather than a fixed band', () => {
    const { container } = render(
      <ThreadBackdrop>
        <div data-testid="card">card</div>
      </ThreadBackdrop>,
    );

    const root = container.firstElementChild as HTMLElement;
    // A fixed height would crop the photograph partway down the card, which reads as
    // a broken image; padding is what leaves margin above and below instead.
    expect(root.className).not.toMatch(/\bh-\[/);
    expect(root.className).toContain('pt-14');
    expect(root.className).toContain('pb-12');
    expect(screen.getByTestId('card')).toBeInTheDocument();
  });

  it('mounts the discussion photograph as a decorative full-bleed layer', () => {
    render(
      <ThreadBackdrop>
        <div />
      </ThreadBackdrop>,
    );

    const image = screen.getByTestId('backdrop-image');
    expect(image.getAttribute('src')).toBe(THREAD_BACKDROP_IMAGE);
    // Decorative: the photograph carries no information the text does not.
    expect(image.getAttribute('alt')).toBe('');
    expect(image.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('keeps the card inside a centred container over the full-bleed image', () => {
    const { container } = render(
      <ThreadBackdrop>
        <div data-testid="card" />
      </ThreadBackdrop>,
    );

    const holder = screen.getByTestId('card').parentElement as HTMLElement;
    expect(holder.className).toContain('max-w-4xl');
    expect(holder.className).toContain('z-10');
    expect((container.firstElementChild as HTMLElement).className).toContain('relative');
  });
});
