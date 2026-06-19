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

// The verification surface lives in an accordion at the bottom of My Property now.
// Stub it so these tests stay focused on the property record itself.
vi.mock('@/components/profile/verification/VerificationAccordion', () => ({
  default: () => <div data-testid="verification-accordion" />,
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
const mockUsePendingVerificationsQuery = vi.fn(() => ({ data: { pending_responses: [] } }));

vi.mock('@/hooks/useProfileData', () => ({
  useMyPropertiesQuery: () => mockUseMyPropertiesQuery(),
  usePendingVerificationsQuery: () => mockUsePendingVerificationsQuery(),
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
    it('surfaces the verification accordion as the primary action when nothing is verified', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: { verified_properties: [], pending_requests: [] },
        isLoading: false,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      // No standalone "No Verified Properties" card anymore — verification lives inline.
      expect(screen.queryByText(/no verified properties/i)).not.toBeInTheDocument();
      expect(screen.getByTestId('verification-accordion')).toBeInTheDocument();
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

    it('renders co-members widget when co-members exist', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByTestId('co-members-widget')).toHaveTextContent('owner');
    });

    it('states the relationship to the property', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      // One co-member in the mock means two owners total.
      expect(screen.getByText(/one of 2 owners here/i)).toBeInTheDocument();
    });

    it('does not render bedroom/bathroom/carpark stats', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.queryByText('Bedrooms')).not.toBeInTheDocument();
      expect(screen.queryByText('Bathrooms')).not.toBeInTheDocument();
      expect(screen.queryByText('Carparks')).not.toBeInTheDocument();
    });

    it('renders the society rules link', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      const rulesLink = screen.getByRole('link', { name: /read the rules/i });
      expect(rulesLink).toHaveAttribute('href', '/guidelines');
    });

    it('renders the address as a heading', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      const headings = screen.getAllByRole('heading', { level: 3 });
      expect(headings.some((h) => h.textContent === '41 Huri Street')).toBe(true);
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
      // Format the same way the component does so the assertion is locale-agnostic.
      const expected = new Date('2026-04-01T00:00:00Z').toLocaleDateString();
      expect(screen.getByText(`Requested: ${expected}`)).toBeInTheDocument();
    });

    it('renders withdraw button', () => {
      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /withdraw request/i })).toBeInTheDocument();
    });
  });

  describe('Sole owner (no co-members)', () => {
    it('renders the singular relationship line and no co-members widget', () => {
      mockUseMyPropertiesQuery.mockReturnValue({
        data: {
          verified_properties: [{ ...mockVerifiedProperties[0], co_members: [] }],
          pending_requests: [],
        },
        isLoading: false,
        error: null,
      });

      render(<MyPropertySection />, { wrapper: createWrapper() });
      expect(screen.getByText(/you're the owner here/i)).toBeInTheDocument();
      expect(screen.queryByTestId('co-members-widget')).not.toBeInTheDocument();
    });
  });
});
