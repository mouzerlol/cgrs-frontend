'use client';

/**
 * Fetches the current user's community from the backend (GET /api/v1/users/community).
 * Only runs when signed in; depends on tenant context from JWT.
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { apiRequest } from '@/lib/api/client';

/** Backend community response (snake_case). */
export interface CommunityResponse {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  created_at: string;
}

export function useCommunity() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery<CommunityResponse>({
    queryKey: ['community'],
    queryFn: () => apiRequest<CommunityResponse>('/api/v1/users/community', getToken),
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
