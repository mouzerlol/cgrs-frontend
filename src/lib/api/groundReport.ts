/**
 * API client for ground reports.
 *
 * Zone/report/image writes require the `manageGroundReports` capability
 * server-side; the member-facing read (`getMemberGroundReport`) is gated to
 * owners-and-up. Image uploads are multipart and MUST carry a lat/lng.
 */

import { apiRequest } from '@/lib/api/client';
import type {
  GroundReportCreateRequest,
  GroundReportImageListResponse,
  GroundReportImageResponse,
  GroundReportListResponse,
  GroundReportResponse,
  GroundReportUpdateRequest,
  MemberGroundReportResponse,
  UploadGroundReportImageInput,
  ZoneCreateRequest,
  ZoneListResponse,
  ZoneResponse,
  ZoneUpdateRequest,
} from '@/types/ground-report';

/** Mirror of the server-side 30 MB cap (Cloud Run request-body limit). */
export const MAX_IMAGE_UPLOAD_BYTES = 31_457_280;

/** Mirror of the server-side allow-list (JPEG, PNG only). */
export const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png'] as const;

type GetToken = () => Promise<string | null>;

const BASE = '/api/v1/ground-report';

// ---- zones ------------------------------------------------------------------

export async function listZones(getToken: GetToken): Promise<ZoneListResponse> {
  return apiRequest<ZoneListResponse>(`${BASE}/zones`, getToken);
}

export async function createZone(
  body: ZoneCreateRequest,
  getToken: GetToken,
): Promise<ZoneResponse> {
  return apiRequest<ZoneResponse>(`${BASE}/zones`, getToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function updateZone(
  zoneId: string,
  body: ZoneUpdateRequest,
  getToken: GetToken,
): Promise<ZoneResponse> {
  return apiRequest<ZoneResponse>(`${BASE}/zones/${zoneId}`, getToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteZone(zoneId: string, getToken: GetToken): Promise<void> {
  await apiRequest<void>(`${BASE}/zones/${zoneId}`, getToken, { method: 'DELETE' });
}

// ---- reports ----------------------------------------------------------------

export async function listReports(
  zoneId: string,
  getToken: GetToken,
): Promise<GroundReportListResponse> {
  return apiRequest<GroundReportListResponse>(`${BASE}/zones/${zoneId}/reports`, getToken);
}

export async function createReport(
  body: GroundReportCreateRequest,
  getToken: GetToken,
): Promise<GroundReportResponse> {
  return apiRequest<GroundReportResponse>(`${BASE}/reports`, getToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function updateReport(
  reportId: string,
  body: GroundReportUpdateRequest,
  getToken: GetToken,
): Promise<GroundReportResponse> {
  return apiRequest<GroundReportResponse>(`${BASE}/reports/${reportId}`, getToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function deleteReport(reportId: string, getToken: GetToken): Promise<void> {
  await apiRequest<void>(`${BASE}/reports/${reportId}`, getToken, { method: 'DELETE' });
}

// ---- images -----------------------------------------------------------------

export async function listImages(
  reportId: string,
  getToken: GetToken,
): Promise<GroundReportImageListResponse> {
  return apiRequest<GroundReportImageListResponse>(
    `${BASE}/reports/${reportId}/images`,
    getToken,
  );
}

export async function uploadImage(
  input: UploadGroundReportImageInput,
  getToken: GetToken,
): Promise<GroundReportImageResponse> {
  const form = new FormData();
  form.append('file', input.file);
  form.append('lat', String(input.lat));
  form.append('lng', String(input.lng));
  form.append('coord_source', input.coordSource);
  if (input.accuracyM != null) form.append('accuracy_m', String(input.accuracyM));
  if (input.caption) form.append('caption', input.caption);
  return apiRequest<GroundReportImageResponse>(
    `${BASE}/reports/${input.reportId}/images`,
    getToken,
    { method: 'POST', body: form },
  );
}

export async function reorderImages(
  reportId: string,
  orderedIds: string[],
  getToken: GetToken,
): Promise<void> {
  await apiRequest<void>(`${BASE}/reports/${reportId}/images:reorder`, getToken, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ordered_ids: orderedIds }),
  });
}

export async function deleteImage(
  reportId: string,
  imageId: string,
  getToken: GetToken,
): Promise<void> {
  await apiRequest<void>(`${BASE}/reports/${reportId}/images/${imageId}`, getToken, {
    method: 'DELETE',
  });
}

// ---- member-facing read -----------------------------------------------------

export async function getMemberGroundReport(
  getToken: GetToken,
): Promise<MemberGroundReportResponse> {
  return apiRequest<MemberGroundReportResponse>(`${BASE}:member`, getToken);
}
