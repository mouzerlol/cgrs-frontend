'use client';

/**
 * React Query hooks for society documents. Callers should gate on the
 * manageSocietyDocuments capability (canAccessManagement) before enabling.
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';
import {
  deleteSocietyDocument,
  getSocietyDocumentDownloadUrl,
  getSocietyDocumentViewUrl,
  listSocietyDocuments,
  listVisibleSocietyDocuments,
  replaceSocietyDocumentFile,
  updateSocietyDocument,
  uploadSocietyDocument,
  type UploadDocumentInput,
} from '@/lib/api/societyDocuments';
import type {
  SocietyDocumentListResponse,
  SocietyDocumentResponse,
  SocietyDocumentUpdateRequest,
  VisibleSocietyDocumentsResponse,
} from '@/types/admin';

export const SOCIETY_DOCUMENTS_QUERY_KEY = ['society-documents'] as const;
export const VISIBLE_SOCIETY_DOCUMENTS_QUERY_KEY = ['society-documents', 'visible'] as const;

export function useSocietyDocumentsQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<SocietyDocumentListResponse, Error>({
    queryKey: SOCIETY_DOCUMENTS_QUERY_KEY,
    queryFn: () => listSocietyDocuments(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

/**
 * Member-facing read (owners-and-up): visible categories grouped with documents.
 * Hits the `:visible` endpoint, which does NOT require the manage capability — so
 * plain owners no longer 403 on the /account/society documents section.
 */
export function useVisibleSocietyDocumentsQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<VisibleSocietyDocumentsResponse, Error>({
    queryKey: VISIBLE_SOCIETY_DOCUMENTS_QUERY_KEY,
    queryFn: () => listVisibleSocietyDocuments(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useUploadSocietyDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SocietyDocumentResponse, Error, UploadDocumentInput>({
    mutationFn: (input) => uploadSocietyDocument(input, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useUpdateSocietyDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<
    SocietyDocumentResponse,
    Error,
    { id: string; body: SocietyDocumentUpdateRequest }
  >({
    mutationFn: ({ id, body }) => updateSocietyDocument(id, body, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useReplaceSocietyDocumentFile() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<SocietyDocumentResponse, Error, { id: string; file: File }>({
    mutationFn: ({ id, file }) => replaceSocietyDocumentFile(id, file, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENTS_QUERY_KEY });
    },
  });
}

export function useDeleteSocietyDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteSocietyDocument(id, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENTS_QUERY_KEY });
    },
  });
}

/** Fetch a presigned URL and open it in a new tab (download / inline view). */
export function useDownloadSocietyDocument() {
  const { getToken } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { download_url } = await getSocietyDocumentDownloadUrl(id, getToken);
      if (typeof window !== 'undefined') {
        window.open(download_url, '_blank', 'noopener,noreferrer');
      }
    },
  });
}

/** Resolve a presigned URL for inline viewing (returns the URL instead of opening a tab). */
export function useSocietyDocumentViewUrl() {
  const { getToken } = useAuth();

  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      const { download_url } = await getSocietyDocumentDownloadUrl(id, getToken);
      return download_url;
    },
  });
}

/**
 * Member-facing download (owners-and-up): fetch a visibility-scoped presigned URL
 * and open it in a new tab. Uses the `view-url` endpoint, which does NOT require
 * the manage capability.
 */
export function useDownloadVisibleSocietyDocument() {
  const { getToken } = useAuth();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { download_url } = await getSocietyDocumentViewUrl(id, getToken);
      if (typeof window !== 'undefined') {
        window.open(download_url, '_blank', 'noopener,noreferrer');
      }
    },
  });
}

/** Member-facing inline view: resolve a visibility-scoped presigned URL (no manage capability). */
export function useVisibleSocietyDocumentViewUrl() {
  const { getToken } = useAuth();

  return useMutation<string, Error, string>({
    mutationFn: async (id) => {
      const { download_url } = await getSocietyDocumentViewUrl(id, getToken);
      return download_url;
    },
  });
}
