import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MyPropertySection from '@/components/profile/sections/MyPropertySection';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function TestWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

vi.mock('@/components/profile/sections/PropertyMap', () => ({
  default: vi.fn(({ address }: { address: string }) => <div data-testid="property-map">{address}</div>),
}));

vi.mock('@/components/profile/sections/CoMembersWidget', () => ({
  default: vi.fn(({ type }: { type: string }) => <div data-testid="co-members-widget">{type}</div>),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn(() => Promise.resolve('token')),
    isLoaded: true,
    isSignedIn: true,
  }),
  ClerkProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/lib/api/verification', () => ({
  withdrawVerificationRequest: vi.fn(),
}));

vi.mock('@/components/ui/Skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

const mockVerifiedProperties = [
  {
    property_id: 'prop-1',
    street_name: 'Huri Street',
    street_number: '41',
    verification_type: 'owner',
    verified_at: '2026-04-04T00:00:00Z',
    unit_number: null,
    property_type: 'house',
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 2,
    lat: -36.9497,
    lng: 174.7912,
    image_url: null,
    co_members: [
      { user_id: '2', first_name: 'Jane', last_name: 'Doe', avatar_url: null },
    ],
  },
];

const mockPendingRequests = [
  {
    id: 'req-1',
    property_id: 'prop-2',
    street_name: 'Huri Street',
    street_number: '45',
    verification_type: 'resident',
    status: 'pending',
    created_at: '2026-04-01T00:00:00Z',
  },
];

const mockUseMyPropertiesQuery = vi.fn();

vi.mock('@/hooks/useProfileData', () => ({
  useMyPropertiesQuery: () => mockUseMyPropertiesQuery(),
  useInvalidateProfileData: vi.fn(() => ({
    invalidateMyProperties: vi.fn(),
  })),
}));

describe('MyPropertySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('shows skeleton while loading', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    });
  });

  describe('Error state', () => {
    it('shows error message when failed to load', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed'),
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText(/failed to load properties/i)).toBeInTheDocument();
    });
  });

  describe('Empty state', () => {
    it('shows no verified properties message', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: { verified_properties: [], pending_requests: [] },
        isLoading: false,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText(/no verified properties/i)).toBeInTheDocument();
    });
  });

  describe('With verified properties', () => {
    beforeEach(() => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: {
          verified_properties: mockVerifiedProperties,
          pending_requests: [],
        },
        isLoading: false,
        error: null,
      });
    });

    it('renders header', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByRole('heading', { name: /my property/i })).toBeInTheDocument();
    });

    it('renders property map with address', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByTestId('property-map')).toHaveTextContent('41 Huri Street');
    });

    it('renders co-members widget', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByTestId('co-members-widget')).toHaveTextContent('owner');
    });

    it('renders detail items for bedrooms, bathrooms, carparks', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText('Bedrooms')).toBeInTheDocument();
      expect(screen.getByText('Bathrooms')).toBeInTheDocument();
      expect(screen.getByText('Carparks')).toBeInTheDocument();
    });

    it('shows verified date', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText(/verified on: 4\/4\/2026/i)).toBeInTheDocument();
    });

    it('renders address in details card', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      // The address appears in both PropertyMap mock and details card h3
      // Check for the h3 heading specifically
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.some(h => h.textContent === '41 Huri Street')).toBe(true);
    });

    it('does not render pending requests section', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.queryByRole('heading', { name: /pending requests/i })).not.toBeInTheDocument();
    });
  });

  describe('With pending requests', () => {
    beforeEach(() => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: {
          verified_properties: [],
          pending_requests: mockPendingRequests,
        },
        isLoading: false,
        error: null,
      });
    });

    it('renders pending requests section', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByRole('heading', { name: /pending requests/i })).toBeInTheDocument();
    });

    it('renders pending request address', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText('45 Huri Street')).toBeInTheDocument();
    });

    it('renders request date', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText(/requested: 4\/1\/2026/i)).toBeInTheDocument();
    });

    it('renders withdraw button', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /withdraw request/i })).toBeInTheDocument();
    });
  });

  describe('Two-column layout', () => {
    it('applies lg:w-1/3 class to left column', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: {
          verified_properties: mockVerifiedProperties,
          pending_requests: [],
        },
        isLoading: false,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      const leftColumn = screen.getByTestId('property-map').closest('[class*="lg:w-1/3"]');
      expect(leftColumn).toBeInTheDocument();
    });

    it('applies lg:w-2/3 class to right column', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: {
          verified_properties: mockVerifiedProperties,
          pending_requests: [],
        },
        isLoading: false,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      const detailsCard = screen.getByText('Bedrooms').closest('[class*="lg:w-2/3"]');
      expect(detailsCard).toBeInTheDocument();
    });
  });
});
