'use client';

/**
 * React Query hooks for society document categories. Callers should gate on the
 * manageSocietyDocuments capability (canAccessManagement) before enabling.
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';
import {
  createSocietyDocumentCategory,
  deleteSocietyDocumentCategory,
  listSocietyDocumentCategories,
  updateSocietyDocumentCategory,
} from '@/lib/api/societyDocumentCategories';
import { SOCIETY_DOCUMENTS_QUERY_KEY } from '@/hooks/useSocietyDocuments';
import type {
  SocietyDocumentCategory,
  SocietyDocumentCategoryListResponse,
} from '@/types/admin';

export const SOCIETY_DOCUMENT_CATEGORIES_QUERY_KEY = ['society-document-categories'] as const;

export function useSocietyDocumentCategoriesQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery<SocietyDocumentCategoryListResponse, Error>({
    queryKey: SOCIETY_DOCUMENT_CATEGORIES_QUERY_KEY,
    queryFn: () => listSocietyDocumentCategories(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

/** Invalidate both categories and documents (a category change can affect doc grouping). */
function useInvalidateCategoryAndDocuments() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENT_CATEGORIES_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: SOCIETY_DOCUMENTS_QUERY_KEY });
  };
}

export function useCreateSocietyDocumentCategory() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateCategoryAndDocuments();

  return useMutation<SocietyDocumentCategory, Error, { label: string; is_visible?: boolean }>({
    mutationFn: (body) => createSocietyDocumentCategory(body, getToken),
    onSuccess: invalidate,
  });
}

export function useUpdateSocietyDocumentCategory() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateCategoryAndDocuments();

  return useMutation<
    SocietyDocumentCategory,
    Error,
    { id: string; body: { label?: string; is_visible?: boolean } }
  >({
    mutationFn: ({ id, body }) => updateSocietyDocumentCategory(id, body, getToken),
    onSuccess: invalidate,
  });
}

export function useDeleteSocietyDocumentCategory() {
  const { getToken } = useAuth();
  const invalidate = useInvalidateCategoryAndDocuments();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteSocietyDocumentCategory(id, getToken),
    onSuccess: invalidate,
  });
}
