'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getBootstrap } from '@/lib/api/bootstrap';
import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser';
import { queryKeys } from '@/lib/query-keys';

export const BOOTSTRAP_QUERY_KEY = (userId: string | null | undefined) =>
  ['bootstrap', userId ?? 'anonymous'] as const;

export function useBootstrap() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: BOOTSTRAP_QUERY_KEY(userId),
    queryFn: async () => {
      const data = await getBootstrap(getToken);

      if (data.user) queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data.user);
      if (data.community) queryClient.setQueryData(['community'], data.community);
      if (data.feature_flags) queryClient.setQueryData(queryKeys.featureFlags, data.feature_flags);

      return data;
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: Infinity,
  });
}
