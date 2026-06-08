'use client';

/**
 * React Query hooks for the staff verification reviewer queue and
 * property-membership management (approve/reject pending requests, view a
 * property's members, revoke a relationship).
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { STALE_TIMES } from '@/lib/cache-config';
import {
  getReviewQueue,
  reviewVerification,
  getProperties,
  getPropertyMembers,
  revokeRelationship,
  type ReviewQueueResponse,
  type PropertyDirectoryResponse,
  type PropertyDirectorySort,
  type PropertyDirectoryOrder,
  type PropertyMembersResponse,
} from '@/lib/api/verification';

export const verificationReviewKeys = {
  all: ['verification-review'] as const,
  queue: () => [...verificationReviewKeys.all, 'queue'] as const,
  members: (propertyId: string) => [...verificationReviewKeys.all, 'members', propertyId] as const,
  directory: (offset: number, sort: string, order: string) =>
    [...verificationReviewKeys.all, 'directory', offset, sort, order] as const,
};

/** Page size for the property directory (mirrors the petition signatures pager). */
export const PROPERTY_DIRECTORY_PAGE_SIZE = 25;

/** The pending verification review queue (committee class only). */
export function useReviewQueueQuery(enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<ReviewQueueResponse, Error>({
    queryKey: verificationReviewKeys.queue(),
    queryFn: () => getReviewQueue(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Paginated directory of properties with active members (committee class only). */
export function usePropertiesQuery(params: {
  offset: number;
  sort: PropertyDirectorySort;
  order: PropertyDirectoryOrder;
  enabled?: boolean;
}) {
  const { offset, sort, order, enabled = true } = params;
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<PropertyDirectoryResponse, Error>({
    queryKey: verificationReviewKeys.directory(offset, sort, order),
    queryFn: () => getProperties(getToken, { offset, limit: PROPERTY_DIRECTORY_PAGE_SIZE, sort, order }),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Active residents and owners of a property (committee class only). */
export function usePropertyMembersQuery(propertyId: string | null, enabled = true) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  return useQuery<PropertyMembersResponse, Error>({
    queryKey: verificationReviewKeys.members(propertyId ?? ''),
    queryFn: () => getPropertyMembers(propertyId as string, getToken),
    enabled: enabled && !!propertyId && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.SHORT,
  });
}

/** Approve or reject a pending verification request. */
export function useReviewVerificationMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { requestId: string; approved: boolean; note?: string | null }) =>
      reviewVerification(vars.requestId, { approved: vars.approved, note: vars.note }, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Revoke a resident's or owner's relationship to a property. */
export function useRevokeRelationshipMutation() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { relationshipId: string; reason?: string | null }) =>
      revokeRelationship(vars.relationshipId, { reason: vars.reason }, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: verificationReviewKeys.all });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

/** Roles permitted to access the reviewer surfaces (mirrors backend). */
export const VERIFICATION_REVIEWER_ROLES = [
  'society_manager',
  'committee_member',
  'committee_chairperson',
] as const;

export function isVerificationReviewer(role: string | null | undefined, isSuperadmin = false): boolean {
  if (isSuperadmin) return true;
  return !!role && (VERIFICATION_REVIEWER_ROLES as readonly string[]).includes(role);
}
