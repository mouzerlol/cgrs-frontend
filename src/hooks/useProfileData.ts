/**
 * Centralized React Query hooks for all profile section data.
 * Fetches data once at the layout level and reuses across all sections.
 */

import { useAuth } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';

import { apiRequest } from '@/lib/api/client';
import {
  getVerificationStatus,
  getStreets,
  getPendingVerifications,
  getMyProperties,
  withdrawVerificationRequest,
  type VerificationStatusResponse,
  type StreetResponse,
  type PendingVerificationsResponse,
  type MyPropertiesResponse,
} from '@/lib/api/verification';
import {
  getMyRequests,
  type ManagementRequestWithTask,
} from '@/lib/api/management-requests';
import type { CurrentUserResponse } from './useCurrentUser';
import { CURRENT_USER_QUERY_KEY } from './useCurrentUser';

// Query keys factory to ensure consistency
export const profileKeys = {
  all: ['profile'] as const,
  verificationStatus: () => [...profileKeys.all, 'verificationStatus'] as const,
  streets: () => [...profileKeys.all, 'streets'] as const,
  pendingVerifications: () => [...profileKeys.all, 'pendingVerifications'] as const,
  myProperties: () => [...profileKeys.all, 'myProperties'] as const,
  managementRequests: () => [...profileKeys.all, 'managementRequests'] as const,
};

/** Fetch current user data */
async function fetchCurrentUser(getToken: () => Promise<string | null>): Promise<CurrentUserResponse> {
  return apiRequest<CurrentUserResponse>('/api/v1/users/me', getToken);
}

/** Hook for current user data */
export function useCurrentUserQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<CurrentUserResponse, Error>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: () => fetchCurrentUser(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

/** Hook for verification status */
export function useVerificationStatusQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<VerificationStatusResponse, Error>({
    queryKey: profileKeys.verificationStatus(),
    queryFn: () => getVerificationStatus(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Hook for streets list */
export function useStreetsQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<StreetResponse[], Error>({
    queryKey: profileKeys.streets(),
    queryFn: () => getStreets(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SLOW,
  });
}

/** Hook for pending verifications (requests from others) */
export function usePendingVerificationsQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<PendingVerificationsResponse, Error>({
    queryKey: profileKeys.pendingVerifications(),
    queryFn: () => getPendingVerifications(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Hook for my properties (verified + pending) */
export function useMyPropertiesQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<MyPropertiesResponse, Error>({
    queryKey: profileKeys.myProperties(),
    queryFn: () => getMyProperties(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Hook for my management/issue requests */
export function useManagementRequestsQuery() {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<ManagementRequestWithTask[], Error>({
    queryKey: profileKeys.managementRequests(),
    queryFn: () => getMyRequests(getToken),
    enabled: isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.FREQUENT,
  });
}

/**
 * Prefetch all profile data in parallel.
 * Call this on mount or on hover to warm up the cache.
 */
export function usePrefetchProfileData() {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    if (!isLoaded || !isSignedIn) return;

    // Prefetch all queries in parallel
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: () => fetchCurrentUser(getToken),
        staleTime: STALE_TIMES.CONTENT,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.verificationStatus(),
        queryFn: () => getVerificationStatus(getToken),
        staleTime: STALE_TIMES.SHORT,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.streets(),
        queryFn: () => getStreets(getToken),
        staleTime: STALE_TIMES.SLOW,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.pendingVerifications(),
        queryFn: () => getPendingVerifications(getToken),
        staleTime: STALE_TIMES.SHORT,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.myProperties(),
        queryFn: () => getMyProperties(getToken),
        staleTime: STALE_TIMES.SHORT,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.managementRequests(),
        queryFn: () => getMyRequests(getToken),
        staleTime: STALE_TIMES.FREQUENT,
      }),
    ]);
  };
}

/** Invalidate all profile queries (use after mutations) */
export function useInvalidateProfileData() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
    invalidateMyProperties: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.myProperties() });
    },
    invalidateVerification: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.verificationStatus() });
      queryClient.invalidateQueries({ queryKey: profileKeys.pendingVerifications() });
    },
  };
}
