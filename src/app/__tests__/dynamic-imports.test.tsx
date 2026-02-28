import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';

// Mock next/dynamic to test loading states
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<any>, options?: { loading?: () => React.ReactNode; ssr?: boolean }) => {
    // Return a component that renders the loading fallback
    const DynamicComponent = (props: any) => {
      if (options?.loading) {
        return options.loading();
      }
      return null;
    };
    DynamicComponent.displayName = 'DynamicComponent';
    return DynamicComponent;
  },
}));

// Mock next/navigation for CalendarContent
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: () => null,
  }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn().mockReturnValue({
      setView: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    }),
    tileLayer: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
    }),
  },
}));

describe('Dynamic import loading states', () => {
  describe('MapPage', () => {
    it('shows MapSkeleton loading fallback while MapSection loads', async () => {
      const MapPage = (await import('@/app/(main)/map/page')).default;
      render(<MapPage />);

      // MapSkeleton renders elements with animate-pulse class
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });
  });

  describe('CalendarPage', () => {
    it('shows CalendarSkeleton loading fallback while CalendarContent loads', async () => {
      const CalendarPage = (await import('@/app/(main)/calendar/page')).default;
      render(<CalendarPage />);

      // CalendarSkeleton renders skeleton elements
      const skeleton = document.querySelector('.skeleton');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('shows placeholder while FooterMap loads', async () => {
      const Footer = (await import('@/components/layout/Footer')).default;
      render(<Footer />);

      // The loading placeholder should be a div with height 160px and forest background
      const placeholder = document.querySelector('div[style*="height: 160px"]');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('EventContent dynamic imports', () => {
    it('exports EventContent as default with dynamic EventMapStatic', async () => {
      const module = await import('@/components/event/EventContent');
      expect(module.default).toBeDefined();
    });
  });
});
