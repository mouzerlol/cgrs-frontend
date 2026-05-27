import { describe, it, expect, vi, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import RibbonHero from '../RibbonHero';

afterEach(() => {
  vi.useRealTimers();
});

describe('RibbonHero', () => {
  it('renders 24 hour slots in the SVG', () => {
    const { container } = render(<RibbonHero now={new Date('2026-07-15T02:00:00Z')} />);
    const slots = container.querySelectorAll('rect');
    expect(slots.length).toBe(24);
  });

  it('positions the "now" marker at the correct horizontal position', () => {
    // 2026-07-15 02:00 UTC = 2026-07-15 14:00 NZST → 14/24 of the width.
    const { container } = render(<RibbonHero now={new Date('2026-07-15T02:00:00Z')} />);
    const polygons = container.querySelectorAll('polygon');
    expect(polygons.length).toBe(1);
    // The marker polygon includes the apex x-coordinate at index 2 of the points attribute.
    const points = polygons[0].getAttribute('points') ?? '';
    expect(points).toMatch(/\d+/);
    // We can also check the marker label.
    const text = container.querySelector('text:last-of-type');
    expect(text?.textContent).toMatch(/14:00 NZS?T/);
  });

  it('renders the figure caption explaining the awake window', () => {
    const { container } = render(<RibbonHero now={new Date('2026-07-15T02:00:00Z')} />);
    const caption = container.querySelector('figcaption');
    expect(caption?.textContent).toMatch(/awake/);
    expect(caption?.textContent).toMatch(/Auckland time/);
  });

  it('uses an aria-described figure for screen readers', () => {
    const { container } = render(<RibbonHero now={new Date('2026-07-15T02:00:00Z')} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('role', 'img');
    expect(svg?.getAttribute('aria-describedby')).toBe('ribbon-caption');
  });
});
