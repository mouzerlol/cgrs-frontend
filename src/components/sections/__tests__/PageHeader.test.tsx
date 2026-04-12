import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PageHeader from '@/components/sections/PageHeader';

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => [{ current: null }, true],
}));

describe('PageHeader Accessibility', () => {
  it('has h1 heading with the page title', () => {
    render(
      <PageHeader
        title="About Coronation Gardens"
        description="Learn about our community"
        eyebrow="About Us"
        backgroundImage="/images/mangere-mountain.jpg"
      />
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('About Coronation Gardens');
  });

  it('background image has descriptive alt text for screen readers', () => {
    render(
      <PageHeader
        title="Community Calendar"
        description="Upcoming events"
        backgroundImage="/images/mangere-mountain.jpg"
      />
    );

    const images = document.querySelectorAll('img');
    // The background image should have non-empty alt text
    const backgroundImages = Array.from(images).filter(
      (img) => img.getAttribute('src')?.includes('mangere-mountain')
    );

    backgroundImages.forEach((img) => {
      const alt = img.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt?.length).toBeGreaterThan(0);
    });
  });
});
