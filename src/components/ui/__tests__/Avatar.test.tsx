import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar } from '../Avatar';

vi.mock('next/image', () => ({
  default: function MockImage(
    props: ComponentProps<'img'> & { fill?: boolean; sizes?: string; unoptimized?: boolean },
  ) {
    const { fill: _f, sizes: _s, unoptimized: _u, ...rest } = props;
    return <img {...rest} />;
  },
}));

describe('Avatar', () => {
  it('uses a square clipped frame when showing an image so avatars stay circular', () => {
    const { container } = render(<Avatar src="https://example.com/p.jpg" name="Test User" size="md" alt="T" />);
    const frame = container.firstElementChild;
    expect(frame).toBeTruthy();
    expect(frame).toHaveClass('w-10', 'h-10', 'overflow-hidden', 'rounded-full');
  });

  it('keeps square frame for initials fallback', () => {
    const { container } = render(<Avatar name="Only Name" size="sm" />);
    const frame = container.firstElementChild;
    expect(frame).toHaveClass('w-9', 'h-9', 'overflow-hidden', 'rounded-full');
  });
});
