import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { BootstrapProvider, useBootstrapReady } from '@/components/providers/BootstrapProvider';
import * as bootstrapApi from '@/lib/api/bootstrap';

const MOCK_USER = { id: 'u1', clerk_user_id: 'c1', email: 'a@b.com', first_name: null, last_name: null, avatar_url: null, created_at: '2024-01-01T00:00:00Z' };

vi.mock('@/lib/api/bootstrap', () => ({
  getBootstrap: vi.fn(),
}));

let mockAuthState = {
  getToken: vi.fn().mockResolvedValue('test-token'),
  isLoaded: true,
  isSignedIn: true,
  userId: 'user_test',
};

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => mockAuthState,
}));

function ReadyProbe() {
  const ready = useBootstrapReady();
  return <span data-testid="ready">{String(ready)}</span>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <BootstrapProvider>{children}</BootstrapProvider>
    </QueryClientProvider>
  );
}

describe('BootstrapProvider — isBootstrapReady', () => {
  it('is false before bootstrap resolves', async () => {
    vi.mocked(bootstrapApi.getBootstrap).mockReturnValue(new Promise(() => {})); // never resolves

    render(<ReadyProbe />, { wrapper: Wrapper });

    expect(screen.getByTestId('ready')).toHaveTextContent('false');
  });

  it('becomes true after bootstrap resolves', async () => {
    vi.mocked(bootstrapApi.getBootstrap).mockResolvedValue({
      user: MOCK_USER as never,
      community: null,
      feature_flags: null,
      unread_count: null,
    });

    render(<ReadyProbe />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });
  });

  it('becomes true when bootstrap errors (fallback path)', async () => {
    vi.mocked(bootstrapApi.getBootstrap).mockRejectedValue(new Error('network failure'));

    render(<ReadyProbe />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });
  });

  it('is true immediately for signed-out users', async () => {
    mockAuthState = { ...mockAuthState, isSignedIn: false, userId: '' };

    render(<ReadyProbe />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('ready')).toHaveTextContent('true');
    });

    // Restore
    mockAuthState = { ...mockAuthState, isSignedIn: true, userId: 'user_test' };
  });
});
