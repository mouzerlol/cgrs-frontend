import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrutallyMinimalHeroHeadingCard } from '@/components/sections/BrutallyMinimalHeroHeadingCard';

describe('BrutallyMinimalHeroHeadingCard', () => {
  it('renders the hero card without a border', () => {
    const { container } = render(<BrutallyMinimalHeroHeadingCard title="Test Title" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).not.toMatch(/\bborder\b/);
  });

  it('renders an icon in the eyebrow when eyebrow text is set', () => {
    const { container } = render(
      <BrutallyMinimalHeroHeadingCard title="Test Title" eyebrow="Forum" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(container.textContent).toContain('Forum');
  });

  it('uses eyebrowIconKey to pick the eyebrow icon', () => {
    const { container } = render(
      <BrutallyMinimalHeroHeadingCard title="Test" eyebrow="Label" eyebrowIconKey="users" />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(container.textContent).toContain('Label');
  });

  it('right-aligns the description paragraph', () => {
    const { container } = render(
      <BrutallyMinimalHeroHeadingCard title="Test Title" description="Tagline here" />
    );
    const p = container.querySelector('p');
    expect(p?.className).toMatch(/\btext-right\b/);
  });
});
