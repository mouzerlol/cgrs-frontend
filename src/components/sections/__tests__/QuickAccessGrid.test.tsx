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
  it('renders CGRS Calendar tile with photo and link to calendar', () => {
    render(<QuickAccessGrid />);

    const link = screen.getByRole('link', { name: /CGRS Calendar/i });
    expect(link).toHaveAttribute('href', '/calendar');

    const img = screen.getByRole('img', { name: /CGRS Calendar/i });
    expect(img).toHaveAttribute('src', expect.stringContaining('cgrs-calendar'));

    const title = link.querySelector('h3');
    expect(title).toHaveTextContent('CGRS Calendar');
  });
});
