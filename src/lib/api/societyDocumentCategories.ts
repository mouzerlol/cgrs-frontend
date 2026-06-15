/**
 * API client for society document categories.
 * Every operation requires the `manageSocietyDocuments` capability server-side.
 */

import { apiRequest } from '@/lib/api/client';
import type {
  SocietyDocumentCategory,
  SocietyDocumentCategoryListResponse,
} from '@/types/admin';

const BASE = '/api/v1/society-document-categories';

export async function listSocietyDocumentCategories(
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentCategoryListResponse> {
  return apiRequest<SocietyDocumentCategoryListResponse>(BASE, getToken);
}

export async function createSocietyDocumentCategory(
  body: { label: string; is_visible?: boolean },
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentCategory> {
  return apiRequest<SocietyDocumentCategory>(BASE, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateSocietyDocumentCategory(
  id: string,
  body: { label?: string; is_visible?: boolean },
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentCategory> {
  return apiRequest<SocietyDocumentCategory>(`${BASE}/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteSocietyDocumentCategory(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  return apiRequest<void>(`${BASE}/${id}`, getToken, { method: 'DELETE' });
}
