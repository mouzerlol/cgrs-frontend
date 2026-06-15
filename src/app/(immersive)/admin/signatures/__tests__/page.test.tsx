import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import type { AdminSignaturesListResponse } from '@/types/admin';
import SignaturesPage from '../page';

const mockGetAdminSignatures = vi.fn();
const mockDownloadSignaturesCsv = vi.fn();
const mockDeleteAdminSignature = vi.fn();
const mockUseCurrentUser = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => mockUseCurrentUser(),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/lib/api/petition', () => ({
  getAdminSignatures: (...args: unknown[]) => mockGetAdminSignatures(...args),
  downloadSignaturesCsv: (...args: unknown[]) => mockDownloadSignaturesCsv(...args),
  deleteAdminSignature: (...args: unknown[]) => mockDeleteAdminSignature(...args),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

function renderWithQueryClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const superadminUser: CurrentUserResponse = {
  user: {
    id: 'u1',
    clerk_user_id: 'clerk_1',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    avatar_url: null,
    created_at: '2020-01-01T00:00:00Z',
  },
  membership: null,
  is_superadmin: true,
  capabilities: [],
};

const residentUser: CurrentUserResponse = {
  ...superadminUser,
  is_superadmin: false,
};

function makeResponse(overrides: Partial<AdminSignaturesListResponse> = {}): AdminSignaturesListResponse {
  return {
    signatures: [
      {
        id: 'sig-1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@example.com',
        resident_type: 'owner',
        address: '1 Analytical Engine Way',
        ip_address: '203.0.113.7',
        email_updates_consent: false,
        consent_recorded_at: null,
        signed_at: '2026-05-05T12:00:00Z',
      },
    ],
    total: 1,
    offset: 0,
    limit: 50,
    has_more: false,
    ...overrides,
  };
}

describe('SignaturesPage', () => {
  beforeEach(() => {
    mockGetAdminSignatures.mockReset();
    mockDownloadSignaturesCsv.mockReset();
    mockDeleteAdminSignature.mockReset();
    mockUseCurrentUser.mockReset();
    mockUseAuth.mockReset();
  });

  it('renders the signatures table for a superadmin and shows total in the header', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse({ total: 137, has_more: true }));

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
    expect(screen.getByText('137 signatures collected')).toBeInTheDocument();
    expect(mockGetAdminSignatures).toHaveBeenCalled();
  });

  it('passes pagination + sort parameters to the API', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse({ total: 137, has_more: true }));

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(mockGetAdminSignatures).toHaveBeenCalled();
    });
    const [, params] = mockGetAdminSignatures.mock.calls[0];
    expect(params).toMatchObject({ offset: 0, limit: 50, sort: 'signed_at', order: 'desc' });
  });

  it('renders the pager when total exceeds the page size', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse({ total: 137, has_more: true }));

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/showing 1–\d+ of 137/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
  });

  it('hides the pager when total fits in one page', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse({ total: 1 }));

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /next page/i })).not.toBeInTheDocument();
  });

  it('renders Access Denied for a non-superadmin and does not fetch signatures', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: residentUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse());

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
    expect(mockGetAdminSignatures).not.toHaveBeenCalled();
  });

  it('calls downloadSignaturesCsv when the Download CSV button is clicked', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse());
    mockDownloadSignaturesCsv.mockResolvedValue(undefined);

    renderWithQueryClient(<SignaturesPage />);

    const button = await screen.findByRole('button', { name: /download csv/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadSignaturesCsv).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an error message when the CSV download fails', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse());
    mockDownloadSignaturesCsv.mockRejectedValue(new Error('boom'));

    renderWithQueryClient(<SignaturesPage />);

    const button = await screen.findByRole('button', { name: /download csv/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/failed to download/i)).toBeInTheDocument();
    });
  });

  it('renders the sign-in Access Denied state for an unauthenticated user', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      getToken: async () => null,
    });
    mockUseCurrentUser.mockReturnValue({ data: undefined, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse());

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
    expect(mockGetAdminSignatures).not.toHaveBeenCalled();
  });

  it('calls deleteAdminSignature when the row delete is confirmed', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(makeResponse());
    mockDeleteAdminSignature.mockResolvedValue(undefined);

    renderWithQueryClient(<SignaturesPage />);

    const trash = await screen.findByRole('button', { name: /delete signature/i });
    fireEvent.click(trash);
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }));

    await waitFor(() => {
      expect(mockDeleteAdminSignature).toHaveBeenCalledWith('sig-1', expect.any(Function));
    });
  });
});
