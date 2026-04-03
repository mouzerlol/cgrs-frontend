/**
 * Centralized React Query hooks for all profile section data.
 * Fetches data once at the layout level and reuses across all sections.
 */

import { useAuth } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';

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

// Query keys factory to ensure consistency
export const profileKeys = {
  all: ['profile'] as const,
  currentUser: () => [...profileKeys.all, 'currentUser'] as const,
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
  const { getToken, isSignedIn } = useAuth();

  return useQuery<CurrentUserResponse, Error>({
    queryKey: profileKeys.currentUser(),
    queryFn: () => fetchCurrentUser(getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Hook for verification status */
export function useVerificationStatusQuery() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<VerificationStatusResponse, Error>({
    queryKey: profileKeys.verificationStatus(),
    queryFn: () => getVerificationStatus(getToken),
    enabled: !!isSignedIn,
    staleTime: 2 * 60 * 1000,
  });
}

/** Hook for streets list */
export function useStreetsQuery() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<StreetResponse[], Error>({
    queryKey: profileKeys.streets(),
    queryFn: () => getStreets(getToken),
    enabled: !!isSignedIn,
    staleTime: 10 * 60 * 1000,
  });
}

/** Hook for pending verifications (requests from others) */
export function usePendingVerificationsQuery() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<PendingVerificationsResponse, Error>({
    queryKey: profileKeys.pendingVerifications(),
    queryFn: () => getPendingVerifications(getToken),
    enabled: !!isSignedIn,
    staleTime: 2 * 60 * 1000,
  });
}

/** Hook for my properties (verified + pending) */
export function useMyPropertiesQuery() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<MyPropertiesResponse, Error>({
    queryKey: profileKeys.myProperties(),
    queryFn: () => getMyProperties(getToken),
    enabled: !!isSignedIn,
    staleTime: 2 * 60 * 1000,
  });
}

/** Hook for my management/issue requests */
export function useManagementRequestsQuery() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<ManagementRequestWithTask[], Error>({
    queryKey: profileKeys.managementRequests(),
    queryFn: () => getMyRequests(getToken),
    enabled: !!isSignedIn,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Prefetch all profile data in parallel.
 * Call this on mount or on hover to warm up the cache.
 */
export function usePrefetchProfileData() {
  const { getToken, isSignedIn } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    if (!isSignedIn) return;

    // Prefetch all queries in parallel
    Promise.all([
      queryClient.prefetchQuery({
        queryKey: profileKeys.currentUser(),
        queryFn: () => fetchCurrentUser(getToken),
        staleTime: 5 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.verificationStatus(),
        queryFn: () => getVerificationStatus(getToken),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.streets(),
        queryFn: () => getStreets(getToken),
        staleTime: 10 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.pendingVerifications(),
        queryFn: () => getPendingVerifications(getToken),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.myProperties(),
        queryFn: () => getMyProperties(getToken),
        staleTime: 2 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: profileKeys.managementRequests(),
        queryFn: () => getMyRequests(getToken),
        staleTime: 1 * 60 * 1000,
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
