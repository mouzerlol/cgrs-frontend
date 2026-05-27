import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SustainabilityPage from '../page';

// If the page tries to reach the cgrs-api, this throws — proving the page is API-free.
const fetchSpy = vi.fn(() => {
  throw new Error('Sustainability page must not call fetch (it should run with no API dependency)');
});

describe('SustainabilityPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T02:00:00Z')); // 14:00 NZST
    Object.defineProperty(global, 'fetch', { value: fetchSpy, writable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockClear();
  });

  it('renders the masthead headline exactly once', () => {
    render(<SustainabilityPage />);
    const headlines = screen.getAllByRole('heading', { level: 1 });
    expect(headlines.length).toBe(1);
    expect(headlines[0].textContent).toBe('When we sleep, and why we chose to.');
  });

  it('renders the "The honest part." section heading', () => {
    render(<SustainabilityPage />);
    expect(screen.getByRole('heading', { name: /The honest part\./ })).toBeInTheDocument();
  });

  it('mentions Sydney and the coal-leaning grid', () => {
    render(<SustainabilityPage />);
    expect(screen.getByText(/Sydney/)).toBeInTheDocument();
    expect(screen.getByText(/coal/)).toBeInTheDocument();
  });

  it('includes the closing line speaking directly to the cold-start visitor', () => {
    render(<SustainabilityPage />);
    expect(
      screen.getByText(
        /if you arrived between 11 pm and 6 am and waited ten seconds for the page to wake up/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Thanks for waiting/i)).toBeInTheDocument();
  });

  it('does not make any network requests during render', () => {
    render(<SustainabilityPage />);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('provides a back-to-home link', () => {
    render(<SustainabilityPage />);
    const homeLink = screen.getByRole('link', { name: /Back to the home page/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
