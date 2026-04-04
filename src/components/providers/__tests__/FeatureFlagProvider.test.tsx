import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { FeatureFlagProvider, useFeatureFlagContext } from '@/components/providers/FeatureFlagProvider';
import * as featureFlagsApi from '@/lib/api/feature-flags';

const FLAG_ID = 'nav.discussion';

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({
    getToken: vi.fn().mockResolvedValue('test-token'),
  }),
}));

vi.mock('@/lib/api/feature-flags', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/api/feature-flags')>();
  return {
    ...actual,
    getFeatureFlags: vi.fn(),
    updateFeatureFlag: vi.fn(),
  };
});

function FlagProbe() {
  const { flags, updateFlag } = useFeatureFlagContext();
  return (
    <div>
      <span data-testid="flag-value">{String(flags[FLAG_ID] ?? false)}</span>
      <button type="button" onClick={() => void updateFlag(FLAG_ID, true)}>
        enable
      </button>
    </div>
  );
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return {
    queryClient,
    Wrapper: ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </QueryClientProvider>
    ),
  };
}

describe('FeatureFlagProvider', () => {
  beforeEach(() => {
    vi.mocked(featureFlagsApi.getFeatureFlags).mockResolvedValue({
      flags: { [FLAG_ID]: false },
      updated_at: null,
    });
    vi.mocked(featureFlagsApi.updateFeatureFlag).mockResolvedValue({
      id: FLAG_ID,
      enabled: true,
      label: 'Discussion',
      description: null,
    });
  });

  it('applies PATCH result to cache and does not refetch GET on settle (avoids stale overwrite)', async () => {
    const user = userEvent.setup();
    const { Wrapper } = createWrapper();

    render(<FlagProbe />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByTestId('flag-value')).toHaveTextContent('false');
    });

    expect(featureFlagsApi.getFeatureFlags).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'enable' }));

    await waitFor(() => {
      expect(screen.getByTestId('flag-value')).toHaveTextContent('true');
    });

    expect(featureFlagsApi.updateFeatureFlag).toHaveBeenCalledWith(
      { id: FLAG_ID, enabled: true },
      expect.any(Function),
    );
    /** No automatic refetch after mutation — stale GET could not race with optimistic state. */
    expect(featureFlagsApi.getFeatureFlags).toHaveBeenCalledTimes(1);
  });
});
