'use client';

/**
 * React Query hooks for the society registration record.
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';
import {
  getSocietyRecord,
  updateSocietyRecord,
  type SocietyRecordResponse,
  type SocietyRecordUpdateRequest,
} from '@/lib/api/society';

export const SOCIETY_RECORD_QUERY_KEY = ['society', 'record'] as const;

/** Fetch the society registration record. Caller should gate on role before enabling. */
export function useSocietyRecordQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<SocietyRecordResponse, Error>({
    queryKey: SOCIETY_RECORD_QUERY_KEY,
    queryFn: () => getSocietyRecord(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

/** Update the society registration record (editSocietyRecord capability required). */
export function useUpdateSocietyRecord() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SocietyRecordResponse, Error, SocietyRecordUpdateRequest>({
    mutationFn: (body) => updateSocietyRecord(body, getToken),
    onSuccess: (data) => {
      queryClient.setQueryData(SOCIETY_RECORD_QUERY_KEY, data);
    },
  });
}
