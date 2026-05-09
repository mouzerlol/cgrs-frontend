import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useBootstrap } from '@/hooks/useBootstrap';
import * as bootstrapApi from '@/lib/api/bootstrap';
import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser';
import { UNREAD_COUNT_KEY } from '@/hooks/useNotifications';
import { queryKeys } from '@/lib/query-keys';

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test-token'),
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_test',
  }),
}));

vi.mock('@/lib/api/bootstrap', () => ({
  getBootstrap: vi.fn(),
}));

const MOCK_USER = { id: 'u1', clerk_user_id: 'c1', email: 'a@b.com', first_name: null, last_name: null, avatar_url: null, created_at: '2024-01-01T00:00:00Z' };
const MOCK_COMMUNITY = { id: 'com1', name: 'Test', slug: 'test', domain: null, created_at: '2024-01-01T00:00:00Z' };
const MOCK_FLAGS = { flags: { beta: true }, updated_at: null };
const MOCK_UNREAD = { total: 2, by_section: [] };

function createClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function Probe({ queryClient }: { queryClient: QueryClient }) {
  useBootstrap();
  return null;
}

describe('useBootstrap — cache seeding', () => {
  beforeEach(() => {
    vi.mocked(bootstrapApi.getBootstrap).mockResolvedValue({
      user: MOCK_USER as never,
      community: MOCK_COMMUNITY as never,
      feature_flags: MOCK_FLAGS,
      unread_count: MOCK_UNREAD,
    });
  });

  it('seeds all four cache keys when bootstrap returns all fields', async () => {
    const queryClient = createClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Probe queryClient={queryClient} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(queryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toEqual(MOCK_USER);
    });

    expect(queryClient.getQueryData(['community'])).toEqual(MOCK_COMMUNITY);
    expect(queryClient.getQueryData(queryKeys.featureFlags)).toEqual(MOCK_FLAGS);
    expect(queryClient.getQueryData(UNREAD_COUNT_KEY)).toEqual(MOCK_UNREAD);
  });

  it('does not seed a cache key when the bootstrap field is null', async () => {
    vi.mocked(bootstrapApi.getBootstrap).mockResolvedValue({
      user: MOCK_USER as never,
      community: MOCK_COMMUNITY as never,
      feature_flags: null,
      unread_count: null,
    });

    const queryClient = createClient();

    render(
      <QueryClientProvider client={queryClient}>
        <Probe queryClient={queryClient} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(queryClient.getQueryData(CURRENT_USER_QUERY_KEY)).toEqual(MOCK_USER);
    });

    expect(queryClient.getQueryData(queryKeys.featureFlags)).toBeUndefined();
    expect(queryClient.getQueryData(UNREAD_COUNT_KEY)).toBeUndefined();
  });
});
