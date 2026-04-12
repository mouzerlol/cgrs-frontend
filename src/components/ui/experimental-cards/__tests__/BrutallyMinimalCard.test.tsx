import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BrutallyMinimalCard from '@/components/ui/experimental-cards/BrutallyMinimalCard';

vi.mock('@/hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: () => [{ current: null }, true],
}));

describe('BrutallyMinimalCard Accessibility', () => {
  it('has aria-label matching the card title for screen reader announcements', () => {
    render(
      <BrutallyMinimalCard
        title="Report an Issue"
        description="Report maintenance issues"
        href="/management-request"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Report an Issue');
  });

  it('announces the correct accessible name for large variant cards', () => {
    render(
      <BrutallyMinimalCard
        title="CGRS Calendar"
        description="Community events"
        href="/calendar"
        variant="large"
        image="/images/calendar.png"
      />
    );

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'CGRS Calendar');
  });

  it('link element is focusable and announces the title to screen readers', () => {
    render(
      <BrutallyMinimalCard
        title="Message Board"
        description="Community notices"
        href="/discussion"
      />
    );

    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('aria-label');
    expect(link.getAttribute('aria-label')).toBe('Message Board');
  });
});
