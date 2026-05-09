import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';
import type { AdminSignaturesListResponse } from '@/types/admin';
import SignaturesPage from '../page';

const mockGetAdminSignatures = vi.fn();
const mockDownloadSignaturesCsv = vi.fn();
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

const fixtureResponse: AdminSignaturesListResponse = {
  signatures: [
    {
      id: 'sig-1',
      first_name: 'Ada',
      last_name: 'Lovelace',
      email: 'ada@example.com',
      resident_type: 'owner',
      address: '1 Analytical Engine Way',
      ip_address: '203.0.113.7',
      signed_at: '2026-05-05T12:00:00Z',
    },
  ],
};

describe('SignaturesPage', () => {
  beforeEach(() => {
    mockGetAdminSignatures.mockReset();
    mockDownloadSignaturesCsv.mockReset();
    mockUseCurrentUser.mockReset();
    mockUseAuth.mockReset();
  });

  it('renders the signatures table for a superadmin', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: superadminUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(fixtureResponse);

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    });
    expect(mockGetAdminSignatures).toHaveBeenCalled();
  });

  it('renders Access Denied for a non-superadmin and does not fetch signatures', async () => {
    mockUseAuth.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: async () => 'token',
    });
    mockUseCurrentUser.mockReturnValue({ data: residentUser, isLoading: false });
    mockGetAdminSignatures.mockResolvedValue(fixtureResponse);

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
    mockGetAdminSignatures.mockResolvedValue(fixtureResponse);
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
    mockGetAdminSignatures.mockResolvedValue(fixtureResponse);
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
    mockGetAdminSignatures.mockResolvedValue(fixtureResponse);

    renderWithQueryClient(<SignaturesPage />);

    await waitFor(() => {
      expect(screen.getByText(/access denied/i)).toBeInTheDocument();
    });
    expect(mockGetAdminSignatures).not.toHaveBeenCalled();
  });
});
