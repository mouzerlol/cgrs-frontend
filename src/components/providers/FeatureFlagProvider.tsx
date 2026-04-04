'use client';

/**
 * Feature flag provider that fetches flags from the backend.
 * Provides React context for accessing feature flags throughout the app.
 *
 * Uses React Query cache as the single source of truth for `flags` so optimistic
 * updates are not overwritten by stale GET refetches (toggle-on flash bug).
 */

import { createContext, useCallback, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getFeatureFlags, updateFeatureFlag, type FeatureFlagsResponse } from '@/lib/api/feature-flags';

interface FeatureFlagContextValue {
  flags: Record<string, boolean>;
  isLoading: boolean;
  isError: boolean;
  updateFlag: (flagId: string, enabled: boolean) => Promise<void>;
  refetch: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(null);

const DEFAULT_FLAGS: Record<string, boolean> = {};

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const { data, isLoading, isError } = useQuery<FeatureFlagsResponse, Error>({
    queryKey: ['featureFlags'],
    queryFn: getFeatureFlags,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  const flags = data?.flags ?? DEFAULT_FLAGS;

  const mutation = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      return updateFeatureFlag({ id, enabled }, getToken);
    },
    onMutate: async ({ id, enabled }) => {
      await queryClient.cancelQueries({ queryKey: ['featureFlags'] });

      const previous = queryClient.getQueryData<FeatureFlagsResponse>(['featureFlags']);

      queryClient.setQueryData<FeatureFlagsResponse>(['featureFlags'], (old) => {
        if (!old) {
          return { flags: { [id]: enabled }, updated_at: null };
        }
        return {
          ...old,
          flags: { ...old.flags, [id]: enabled },
        };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['featureFlags'], context.previous);
      } else {
        queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
      }
    },
    onSuccess: (response, { id }) => {
      queryClient.setQueryData<FeatureFlagsResponse>(['featureFlags'], (old) => {
        if (!old) {
          return { flags: { [id]: response.enabled }, updated_at: null };
        }
        return {
          ...old,
          flags: { ...old.flags, [id]: response.enabled },
        };
      });
    },
  });

  const updateFlag = useCallback(
    async (flagId: string, enabled: boolean) => {
      await mutation.mutateAsync({ id: flagId, enabled });
    },
    [mutation],
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['featureFlags'] });
  }, [queryClient]);

  return (
    <FeatureFlagContext.Provider
      value={{
        flags,
        isLoading,
        isError,
        updateFlag,
        refetch,
      }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlagContext() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlagContext must be used within a FeatureFlagProvider');
  }
  return context;
}
