import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ColdStartBanner from '../ColdStartBanner';

const NOW = new Date('2026-07-14T14:00:00Z'); // 02:00 NZST on Wednesday 2026-07-15

describe('ColdStartBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders almanac metadata line with NZ time and place', () => {
    render(<ColdStartBanner phase="waiting" onRetry={() => {}} now={NOW} />);
    // The mono metadata row uses uppercase weekday.
    expect(screen.getByText(/MANGERE BRIDGE/i)).toBeInTheDocument();
    expect(screen.getByText(/NZST|NZDT/)).toBeInTheDocument();
  });

  it('shows the "Why? →" link to /sustainability in the waiting phase', () => {
    render(<ColdStartBanner phase="waiting" onRetry={() => {}} now={NOW} />);
    const link = screen.getByRole('link', { name: /why/i });
    expect(link).toHaveAttribute('href', '/sustainability');
  });

  it('shows prolonged copy and hides countdown in the prolonged phase', () => {
    render(<ColdStartBanner phase="prolonged" onRetry={() => {}} now={NOW} />);
    expect(screen.getByText(/Still waking/i)).toBeInTheDocument();
    // The cursor character should be gone.
    expect(screen.queryByText('_')).not.toBeInTheDocument();
  });

  it('shows error copy with Try again and Let us know in the timedOut phase', () => {
    const retry = vi.fn();
    render(<ColdStartBanner phase="timedOut" onRetry={retry} now={NOW} />);
    // Find the visible prose specifically (the aria-live region also contains the text).
    const visibleProse = screen.getByText(/^Our server isn't waking up\.$/);
    expect(visibleProse).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /let us know/i })).toBeInTheDocument();
  });

  it('calls onRetry when Try again is clicked', async () => {
    const retry = vi.fn();
    render(<ColdStartBanner phase="timedOut" onRetry={retry} now={NOW} />);
    screen.getByRole('button', { name: /try again/i }).click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it('shows the resolution beat copy in the resolved phase, with no Why link', () => {
    render(<ColdStartBanner phase="resolved" onRetry={() => {}} now={NOW} />);
    expect(screen.getByText(/Awake\. Good morning\./)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /why/i })).not.toBeInTheDocument();
  });

  it('has a polite aria-live region carrying the current prose', () => {
    render(<ColdStartBanner phase="waiting" onRetry={() => {}} now={NOW} />);
    const live = screen.getAllByRole('status');
    expect(live.length).toBeGreaterThan(0);
    expect(live[0]).toHaveAttribute('aria-live', 'polite');
  });

  it('skips the type-in animation when prefers-reduced-motion is set', () => {
    // Mock the media query to report reduced motion before we render.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('reduce'),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(<ColdStartBanner phase="waiting" onRetry={() => {}} now={NOW} />);
    // Full prose appears immediately, no cursor.
    expect(screen.getByText(/Our server is waking up\. About 10 seconds\./)).toBeInTheDocument();
  });
});
