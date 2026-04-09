import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrutallyMinimalHeroHeadingCard } from '@/components/sections/BrutallyMinimalHeroHeadingCard';

describe('BrutallyMinimalHeroHeadingCard', () => {
  it('renders the hero card without a border', () => {
    const { container } = render(<BrutallyMinimalHeroHeadingCard title="Test Title" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).not.toMatch(/\bborder\b/);
  });
});
