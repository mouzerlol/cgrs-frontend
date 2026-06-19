import { useState, type ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VerificationAccordion from '@/components/profile/verification/VerificationAccordion';

// --- Mocks -----------------------------------------------------------------

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function TestWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn(() => Promise.resolve('token')),
    isLoaded: true,
    isSignedIn: true,
  }),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({ get: () => null }),
}));

const markReadMutate = vi.fn();
vi.mock('@/hooks/useNotifications', () => ({
  useMarkRead: () => ({ mutate: markReadMutate }),
}));

const createVerificationRequest = vi.fn((..._args: unknown[]) =>
  Promise.resolve({
    verification_method: 'peer',
    property_id: 'prop-new',
    request_id: 'req-new',
    status: 'pending',
    qr_image_data: null,
    expires_at: null,
  }),
);
const lookupAddress = vi.fn((..._args: unknown[]) =>
  Promise.resolve({ street_name: 'Huri Street', street_number: '41', property_exists: true }),
);
const respondToVerification = vi.fn((..._args: unknown[]) => Promise.resolve({ success: true }));
vi.mock('@/lib/api/verification', () => ({
  createVerificationRequest: (...args: unknown[]) => createVerificationRequest(...args),
  lookupAddress: (...args: unknown[]) => lookupAddress(...args),
  respondToVerification: (...args: unknown[]) => respondToVerification(...args),
}));

// Self-fetching child — stub so it doesn't hit the network; keep the section wrapper in the parent.
vi.mock('@/components/profile/verification/VerificationHistory', () => ({
  default: () => <div data-testid="verification-history" />,
}));

// Isolate the section logic from the address form internals; expose a one-click submit.
vi.mock('@/components/profile/verification/AddressSelectionForm', () => ({
  default: ({
    onSubmit,
    initialVerificationType,
  }: {
    onSubmit: (d: { streetId: string; streetNumber: string; verificationType: 'resident' | 'owner' }) => void;
    initialVerificationType?: 'resident' | 'owner';
  }) => (
    <button
      data-testid="mock-address-submit"
      onClick={() =>
        onSubmit({ streetId: 's1', streetNumber: '41', verificationType: initialVerificationType ?? 'resident' })
      }
    >
      submit
    </button>
  ),
}));

const mockStreets = vi.fn();
const mockStatus = vi.fn();
const mockPending = vi.fn();
const mockMyProperties = vi.fn();
const invalidateMyProperties = vi.fn();
const invalidateVerification = vi.fn();

vi.mock('@/hooks/useProfileData', () => ({
  useStreetsQuery: () => mockStreets(),
  useVerificationStatusQuery: () => mockStatus(),
  usePendingVerificationsQuery: () => mockPending(),
  useMyPropertiesQuery: () => mockMyProperties(),
  useInvalidateProfileData: () => ({ invalidateMyProperties, invalidateVerification, invalidateAll: vi.fn() }),
}));

// --- Fixtures --------------------------------------------------------------

const verified = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    property_id: `prop-${i}`,
    street_name: 'Huri Street',
    street_number: String(40 + i),
    verification_type: i % 2 === 0 ? 'owner' : 'resident',
    verified_at: '2026-04-04T00:00:00Z',
    unit_number: null,
    property_type: 'house',
    bedrooms: null,
    bathrooms: null,
    parking_spaces: null,
    lat: null,
    lng: null,
    image_url: null,
    co_members: [],
  }));

const pendingResponse = {
  id: 'resp-1',
  property_id: 'prop-x',
  street_name: 'Huri Street',
  street_number: '99',
  verification_type: 'resident',
  requester_name: 'Jane',
  requester_email: 'jane@example.com',
  created_at: '2026-04-01T00:00:00Z',
};

function setup({
  verifiedCount = 0,
  hasPending = false,
  responses = 0,
}: {
  verifiedCount?: number;
  hasPending?: boolean;
  responses?: number;
}) {
  mockStreets.mockReturnValue({
    data: [{ id: 's1', name: 'Huri Street', created_at: '2026-01-01T00:00:00Z' }],
    isLoading: false,
  });
  mockStatus.mockReturnValue({
    data: {
      is_verified: verifiedCount > 0,
      role: verifiedCount > 0 ? 'owner' : null,
      has_pending_request: hasPending,
      pending_address: hasPending ? 'Huri Street 50' : null,
      pending_type: hasPending ? 'resident' : null,
      pending_verification_method: hasPending ? 'peer' : null,
    },
    isLoading: false,
  });
  mockPending.mockReturnValue({
    data: {
      my_pending_requests: [],
      pending_responses: Array.from({ length: responses }, () => pendingResponse),
    },
    isLoading: false,
  });
  mockMyProperties.mockReturnValue({
    data: { verified_properties: verified(verifiedCount), pending_requests: [] },
    isLoading: false,
  });
}

function sectionOrder(): string[] {
  return Array.from(document.querySelectorAll('[data-section]')).map(
    (el) => (el as HTMLElement).dataset.section || '',
  );
}

const verifyAnotherButton = () =>
  screen.queryByRole('button', { name: /verify another property/i });

const becomeResident = () => screen.queryByRole('button', { name: /become a resident/i });

/**
 * The "verify another property" reveal is controlled by the parent (the My Property
 * heading CTA) now. This harness mirrors that wiring so cancel/submit collapse it.
 */
function ControlledAccordion({ initialOpen = true }: { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return <VerificationAccordion showVerifyForm={open} onCloseVerifyForm={() => setOpen(false)} />;
}

describe('VerificationAccordion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('state model & ordering (3.2)', () => {
    it('renders one badge per verified property', () => {
      setup({ verifiedCount: 3, hasPending: false });
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      expect(screen.getAllByTestId('property-badge')).toHaveLength(3);
    });

    it('lays badges out in a centered wrapping row', () => {
      setup({ verifiedCount: 2 });
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      const wall = screen.getByTestId('badge-wall');
      expect(wall.className).toMatch(/justify-center/);
    });

    it('orders sections badges → pending → responses → history', () => {
      setup({ verifiedCount: 2, hasPending: true, responses: 1 });
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      expect(sectionOrder()).toEqual(['badges', 'pending', 'responses', 'history']);
    });

    it('omits empty sections', () => {
      setup({ verifiedCount: 2, hasPending: false, responses: 0 });
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      const order = sectionOrder();
      expect(order).not.toContain('pending');
      expect(order).not.toContain('responses');
      expect(order).toContain('badges');
      expect(order).toContain('history');
    });
  });

  describe('NONE state (3.3)', () => {
    beforeEach(() => setup({ verifiedCount: 0, hasPending: false, responses: 0 }));

    it('shows the resident/owner selection flow as the primary content', () => {
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      expect(screen.getByRole('button', { name: /become a resident/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /become an owner/i })).toBeInTheDocument();
    });

    it('shows no badge wall and no "verify another property" button', () => {
      render(<VerificationAccordion />, { wrapper: createWrapper() });
      expect(screen.queryByTestId('badge-wall')).not.toBeInTheDocument();
      expect(verifyAnotherButton()).not.toBeInTheDocument();
    });
  });

  describe('one-in-flight gate (3.4)', () => {
    it('never renders its own verify-another button (the CTA lives in the My Property heading)', () => {
      setup({ verifiedCount: 1, hasPending: false });
      render(<VerificationAccordion showVerifyForm={false} />, { wrapper: createWrapper() });
      expect(verifyAnotherButton()).not.toBeInTheDocument();
    });

    it('reveals the verify-another flow when verified and no pending', () => {
      setup({ verifiedCount: 1, hasPending: false });
      render(<VerificationAccordion showVerifyForm />, { wrapper: createWrapper() });
      expect(becomeResident()).toBeInTheDocument();
    });

    it('does not reveal the flow while a pending request exists, even when asked', () => {
      setup({ verifiedCount: 1, hasPending: true });
      render(<VerificationAccordion showVerifyForm />, { wrapper: createWrapper() });
      expect(becomeResident()).not.toBeInTheDocument();
      // pending request is still shown
      expect(sectionOrder()).toContain('pending');
    });
  });

  describe('inline reveal / collapse (3.5)', () => {
    beforeEach(() => setup({ verifiedCount: 1, hasPending: false }));

    it('shows the flow when revealed and collapses it on cancel', () => {
      render(<ControlledAccordion />, { wrapper: createWrapper() });
      expect(becomeResident()).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(becomeResident()).not.toBeInTheDocument();
    });

    it('submits a new request, then collapses and invalidates queries', async () => {
      render(<ControlledAccordion />, { wrapper: createWrapper() });
      fireEvent.click(screen.getByRole('button', { name: /become a resident/i }));
      fireEvent.click(screen.getByTestId('mock-address-submit'));

      await waitFor(() => expect(createVerificationRequest).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(screen.queryByTestId('mock-address-submit')).not.toBeInTheDocument(),
      );
      expect(invalidateMyProperties).toHaveBeenCalled();
      expect(invalidateVerification).toHaveBeenCalled();
    });
  });

  // The "View my properties" bridge link was removed when verification moved into
  // the My Property surface itself — the badges now sit alongside the property cards.
});
