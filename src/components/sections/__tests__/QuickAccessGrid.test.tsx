import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuickAccessGrid from '@/components/sections/QuickAccessGrid';

vi.mock('@/hooks/useFeatureFlag', () => ({
  useFeatureFlag: () => true,
  useAllFeatureFlags: () => ({}),
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => [{ current: null }, true],
}));

describe('QuickAccessGrid', () => {
  it('renders CGRS Calendar tile with photo background and white title text', () => {
    render(<QuickAccessGrid />);

    const link = screen.getByRole('link', { name: /CGRS Calendar/i });
    expect(link).toHaveAttribute('href', '/calendar');

    const bgLayer = link.querySelector('[style*="cgrs-calendar.png"]');
    expect(bgLayer).toBeTruthy();

    const title = link.querySelector('h3');
    expect(title).toHaveClass('text-white');
  });
});
