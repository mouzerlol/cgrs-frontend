'use client';

/**
 * React Query hook for fetching the current user from the backend.
 * Calls /api/v1/users/me with a Clerk JWT on sign-in.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api/client';

/** Backend returns snake_case; match for API response. */
export interface UserResponse {
  id: string;
  clerk_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface MembershipResponse {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface CurrentUserResponse {
  user: UserResponse;
  membership: MembershipResponse;
  is_superadmin: boolean;
  capabilities: string[];
}

export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<CurrentUserResponse>({
    queryKey: ['currentUser'],
    queryFn: () => apiRequest<CurrentUserResponse>('/api/v1/users/me', getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
