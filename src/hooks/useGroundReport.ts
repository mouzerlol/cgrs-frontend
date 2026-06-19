'use client';

/**
 * React Query hooks for ground reports.
 *
 * Admin (write) hooks should be gated on `canAccessManagement` before enabling;
 * the member view hook should be gated on owners-and-up. Query keys are nested so
 * a report/image mutation invalidates exactly the affected zone/report.
 */

import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { STALE_TIMES } from '@/lib/cache-config';
import {
  createReport,
  createZone,
  deleteImage,
  deleteReport,
  deleteZone,
  getMemberGroundReport,
  listImages,
  listReports,
  listZones,
  reorderImages,
  updateReport,
  updateZone,
  uploadImage,
} from '@/lib/api/groundReport';
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

export const GROUND_REPORT_ZONES_KEY = ['ground-report', 'zones'] as const;
export const groundReportReportsKey = (zoneId: string) =>
  ['ground-report', 'reports', zoneId] as const;
export const groundReportImagesKey = (reportId: string) =>
  ['ground-report', 'images', reportId] as const;
export const GROUND_REPORT_MEMBER_KEY = ['ground-report', 'member'] as const;

// ---- zones ------------------------------------------------------------------

export function useZonesQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  return useQuery<ZoneListResponse, Error>({
    queryKey: GROUND_REPORT_ZONES_KEY,
    queryFn: () => listZones(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useCreateZone() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<ZoneResponse, Error, ZoneCreateRequest>({
    mutationFn: (body) => createZone(body, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUND_REPORT_ZONES_KEY }),
  });
}

export function useUpdateZone() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<ZoneResponse, Error, { zoneId: string; body: ZoneUpdateRequest }>({
    mutationFn: ({ zoneId, body }) => updateZone(zoneId, body, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUND_REPORT_ZONES_KEY }),
  });
}

export function useDeleteZone() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (zoneId) => deleteZone(zoneId, getToken),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUND_REPORT_ZONES_KEY }),
  });
}

// ---- reports ----------------------------------------------------------------

export function useReportsQuery(zoneId: string | null, enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  return useQuery<GroundReportListResponse, Error>({
    queryKey: groundReportReportsKey(zoneId ?? ''),
    queryFn: () => listReports(zoneId as string, getToken),
    enabled: enabled && isLoaded && !!isSignedIn && !!zoneId,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useCreateReport() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<GroundReportResponse, Error, GroundReportCreateRequest>({
    mutationFn: (body) => createReport(body, getToken),
    onSuccess: (report) =>
      qc.invalidateQueries({ queryKey: groundReportReportsKey(report.zone_id) }),
  });
}

export function useUpdateReport() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<GroundReportResponse, Error, { reportId: string; body: GroundReportUpdateRequest }>(
    {
      mutationFn: ({ reportId, body }) => updateReport(reportId, body, getToken),
      onSuccess: (report) =>
        qc.invalidateQueries({ queryKey: groundReportReportsKey(report.zone_id) }),
    },
  );
}

export function useDeleteReport() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, { reportId: string; zoneId: string }>({
    mutationFn: ({ reportId }) => deleteReport(reportId, getToken),
    onSuccess: (_data, { zoneId }) =>
      qc.invalidateQueries({ queryKey: groundReportReportsKey(zoneId) }),
  });
}

// ---- images -----------------------------------------------------------------

export function useImagesQuery(reportId: string | null, enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  return useQuery<GroundReportImageListResponse, Error>({
    queryKey: groundReportImagesKey(reportId ?? ''),
    queryFn: () => listImages(reportId as string, getToken),
    enabled: enabled && isLoaded && !!isSignedIn && !!reportId,
    staleTime: STALE_TIMES.CONTENT,
    retry: 1,
  });
}

export function useUploadImage() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<GroundReportImageResponse, Error, UploadGroundReportImageInput>({
    mutationFn: (input) => uploadImage(input, getToken),
    onSuccess: (image) =>
      qc.invalidateQueries({ queryKey: groundReportImagesKey(image.ground_report_id) }),
  });
}

export function useReorderImages() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, { reportId: string; orderedIds: string[] }>({
    mutationFn: ({ reportId, orderedIds }) => reorderImages(reportId, orderedIds, getToken),
    onSuccess: (_data, { reportId }) =>
      qc.invalidateQueries({ queryKey: groundReportImagesKey(reportId) }),
  });
}

export function useDeleteImage() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  return useMutation<void, Error, { reportId: string; imageId: string }>({
    mutationFn: ({ reportId, imageId }) => deleteImage(reportId, imageId, getToken),
    onSuccess: (_data, { reportId }) =>
      qc.invalidateQueries({ queryKey: groundReportImagesKey(reportId) }),
  });
}

// ---- member-facing read -----------------------------------------------------

export function useMemberGroundReportQuery(enabled = true) {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  return useQuery<MemberGroundReportResponse, Error>({
    queryKey: GROUND_REPORT_MEMBER_KEY,
    queryFn: () => getMemberGroundReport(getToken),
    enabled: enabled && isLoaded && !!isSignedIn,
    // Images carry presigned GET URLs (server TTL); keep cached data well under that
    // window so the reel never renders an already-expired URL. See STALE_TIMES.SHORT.
    staleTime: STALE_TIMES.SHORT,
    retry: 1,
  });
}
