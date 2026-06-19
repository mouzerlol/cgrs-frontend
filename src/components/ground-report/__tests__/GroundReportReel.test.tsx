import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import GroundReportReel from '@/components/ground-report/GroundReportReel';
import type { MemberZoneReportResponse } from '@/types/ground-report';

// next/link → plain anchor for assertion.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

const ZONES: MemberZoneReportResponse[] = [
  {
    zone_id: 'z1',
    label: 'North Slope',
    precinct_keys: ['huri-street'],
    report_id: 'r1',
    period_type: 'week',
    period_start: '2026-06-15',
    period_end: '2026-06-21',
    images: [
      { id: 'i1', url: 'https://x/1', lat: -36.95, lng: 174.79, caption: 'Fresh kerbing', sort_order: 0 },
      { id: 'i2', url: 'https://x/2', lat: -36.951, lng: 174.791, caption: null, sort_order: 1 },
    ],
  },
];

describe('GroundReportReel', () => {
  beforeEach(() => setMatchMedia(false)); // desktop

  it('opens on the zone title slide', () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    expect(screen.getByTestId('title-slide')).toBeInTheDocument();
    expect(screen.getByText('North Slope')).toBeInTheDocument();
    expect(screen.getByText('Week of 15 Jun – 21 Jun')).toBeInTheDocument();
  });

  it('advances to an image slide with caption on ArrowRight', async () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    fireEvent.keyDown(screen.getByTestId('ground-report-reel'), { key: 'ArrowRight' });
    expect(await screen.findByTestId('image-caption')).toHaveTextContent('Fresh kerbing');
  });

  it('renders one indicator dot per slide (title + 2 images = 3)', () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    expect(screen.getByTestId('reel-dots').children).toHaveLength(3);
  });

  it('exposes a CTA to the General Inquiry form on image slides', () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    // CTA only renders on image slides — advance off the title slide first.
    fireEvent.keyDown(screen.getByTestId('ground-report-reel'), { key: 'ArrowRight' });
    expect(screen.getByTestId('reel-cta')).toHaveAttribute('href', '/management-request?category=general');
  });

  it('shows the mini-map marker on image slides but not on the title slide', () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    expect(screen.queryByTestId('reel-mini-map-marker')).toBeNull();
    fireEvent.keyDown(screen.getByTestId('ground-report-reel'), { key: 'ArrowRight' });
    expect(screen.getByTestId('reel-mini-map-marker')).toBeInTheDocument();
  });

  it('loops back to the title slide after the last image', () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    const reel = screen.getByTestId('ground-report-reel');
    fireEvent.keyDown(reel, { key: 'ArrowRight' }); // image 1
    fireEvent.keyDown(reel, { key: 'ArrowRight' }); // image 2
    fireEvent.keyDown(reel, { key: 'ArrowRight' }); // wrap → title
    expect(screen.getByTestId('title-slide')).toBeInTheDocument();
  });

  it('shows a fallback card when an image fails to load', async () => {
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    fireEvent.keyDown(screen.getByTestId('ground-report-reel'), { key: 'ArrowRight' });
    const img = await screen.findByAltText('Fresh kerbing');
    fireEvent.error(img);
    expect(screen.getByTestId('image-fallback')).toBeInTheDocument();
    expect(screen.queryByAltText('Fresh kerbing')).toBeNull();
  });

  it('advances via the mobile control dock', () => {
    setMatchMedia(true); // mobile
    render(<GroundReportReel zones={ZONES} onClose={() => {}} />);
    const dock = screen.getByTestId('reel-mobile-dock');
    fireEvent.click(within(dock).getByLabelText('Next'));
    expect(screen.getByTestId('slide-image')).toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<GroundReportReel zones={ZONES} onClose={onClose} />);
    fireEvent.keyDown(screen.getByTestId('ground-report-reel'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
