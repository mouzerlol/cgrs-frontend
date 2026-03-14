'use client';

/**
 * React Query hooks for authorization endpoints.
 * Provides capability checks, member listing, and role management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { getMyCapabilities, getMembers, getMember, promoteMember } from '@/lib/api/authorization';
import type { CapabilityResponse, MemberSummaryResponse, RoleEnum } from '@/types/authorization';

/** Fetch current user's capabilities from authorization service. */
export function useCapabilities() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<CapabilityResponse>({
    queryKey: ['capabilities'],
    queryFn: () => getMyCapabilities(getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
}

/** Check if user has a specific capability. */
export function useHasCapability(requiredCapability: string) {
  const { data } = useCapabilities();
  return data?.capabilities.includes(requiredCapability) ?? false;
}

/** Fetch all members of the current community. */
export function useMembers() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<MemberSummaryResponse[]>({
    queryKey: ['members'],
    queryFn: () => getMembers(getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single member by ID. */
export function useMember(memberId: string) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<MemberSummaryResponse>({
    queryKey: ['members', memberId],
    queryFn: () => getMember(memberId, getToken),
    enabled: !!isSignedIn && !!memberId,
  });
}

/** Promote a member to a new role. */
export function usePromoteMember() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: RoleEnum }) =>
      promoteMember(memberId, role, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['capabilities'] });
    },
  });
}
