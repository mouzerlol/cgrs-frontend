/**
 * API client for society documents.
 * Every operation requires the `manageSocietyDocuments` capability server-side.
 */

import { apiRequest } from '@/lib/api/client';
import type {
  SocietyDocumentDownloadUrlResponse,
  SocietyDocumentListResponse,
  SocietyDocumentResponse,
  SocietyDocumentUpdateRequest,
  VisibleSocietyDocumentsResponse,
} from '@/types/admin';

/** Mirror of the server-side 30 MB cap (Cloud Run request-body limit). */
export const MAX_DOCUMENT_UPLOAD_BYTES = 31_457_280;

/** Mirror of the server-side allow-list (PDF, Word, Excel, CSV, PNG, JPEG). */
export const ALLOWED_DOCUMENT_CONTENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/png',
  'image/jpeg',
] as const;

export interface UploadDocumentInput {
  file: File;
  title: string;
  categoryId?: string | null;
  description?: string;
  visibility?: number;
}

export async function listSocietyDocuments(
  getToken: () => Promise<string | null>,
  params?: {
    categoryId?: string;
    uncategorised?: boolean;
    source?: string;
    limit?: number;
    offset?: number;
  },
): Promise<SocietyDocumentListResponse> {
  const search = new URLSearchParams();
  if (params?.categoryId) search.set('category_id', params.categoryId);
  if (params?.uncategorised) search.set('uncategorised', 'true');
  if (params?.source) search.set('source', params.source);
  if (params?.limit != null) search.set('limit', String(params.limit));
  if (params?.offset != null) search.set('offset', String(params.offset));
  const qs = search.toString();
  return apiRequest<SocietyDocumentListResponse>(
    `/api/v1/society-documents${qs ? `?${qs}` : ''}`,
    getToken,
  );
}

export async function getSocietyDocument(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentResponse> {
  return apiRequest<SocietyDocumentResponse>(`/api/v1/society-documents/${id}`, getToken);
}

/**
 * Member-facing read (owners-and-up): visible categories grouped with the
 * documents the caller may see. Unlike listSocietyDocuments, this does NOT
 * require the manageSocietyDocuments capability.
 */
export async function listVisibleSocietyDocuments(
  getToken: () => Promise<string | null>,
): Promise<VisibleSocietyDocumentsResponse> {
  return apiRequest<VisibleSocietyDocumentsResponse>(
    '/api/v1/society-documents:visible',
    getToken,
  );
}

/**
 * Member-facing presigned GET URL (owners-and-up, scoped to visible documents).
 * Mirrors getSocietyDocumentDownloadUrl but does NOT require the manage capability.
 */
export async function getSocietyDocumentViewUrl(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentDownloadUrlResponse> {
  return apiRequest<SocietyDocumentDownloadUrlResponse>(
    `/api/v1/society-documents/${id}/view-url`,
    getToken,
  );
}

export async function uploadSocietyDocument(
  input: UploadDocumentInput,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentResponse> {
  const form = new FormData();
  form.append('file', input.file);
  form.append('title', input.title);
  if (input.categoryId != null && input.categoryId !== '') {
    form.append('category_id', input.categoryId);
  }
  if (input.description != null && input.description !== '') {
    form.append('description', input.description);
  }
  if (input.visibility != null) form.append('visibility', String(input.visibility));
  return apiRequest<SocietyDocumentResponse>('/api/v1/society-documents', getToken, {
    method: 'POST',
    body: form,
  });
}

export async function updateSocietyDocument(
  id: string,
  body: SocietyDocumentUpdateRequest,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentResponse> {
  return apiRequest<SocietyDocumentResponse>(`/api/v1/society-documents/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function replaceSocietyDocumentFile(
  id: string,
  file: File,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentResponse> {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<SocietyDocumentResponse>(`/api/v1/society-documents/${id}/file`, getToken, {
    method: 'PATCH',
    body: form,
  });
}

export async function getSocietyDocumentDownloadUrl(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<SocietyDocumentDownloadUrlResponse> {
  return apiRequest<SocietyDocumentDownloadUrlResponse>(
    `/api/v1/society-documents/${id}/download`,
    getToken,
  );
}

export async function deleteSocietyDocument(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  return apiRequest<void>(`/api/v1/society-documents/${id}`, getToken, { method: 'DELETE' });
}
