/**
 * Ground Report types — mirror of the cgrs-api `/api/v1/ground-report` schemas.
 *
 * Zones group frontend precincts; ground reports cover a week/month period;
 * images carry a mandatory lat/lng. The member-facing view returns the latest
 * active report per active zone with presigned image URLs.
 */

export type GroundReportVisibility = 'active' | 'archived';
export type GroundReportPeriodType = 'week' | 'month';
export type GroundReportCoordSource = 'device' | 'exif' | 'manual';

export interface ZoneResponse {
  id: string;
  community_id: string;
  label: string;
  visibility: GroundReportVisibility;
  precinct_keys: string[];
  created_at: string;
  updated_at: string;
}

export interface ZoneListResponse {
  items: ZoneResponse[];
}

export interface ZoneCreateRequest {
  label: string;
  precinct_keys: string[];
  visibility?: GroundReportVisibility;
}

export interface ZoneUpdateRequest {
  label?: string;
  precinct_keys?: string[];
  visibility?: GroundReportVisibility;
}

export interface GroundReportResponse {
  id: string;
  community_id: string;
  zone_id: string;
  period_type: GroundReportPeriodType;
  period_start: string;
  period_end: string;
  visibility: GroundReportVisibility;
  created_at: string;
  updated_at: string;
}

export interface GroundReportListResponse {
  items: GroundReportResponse[];
}

export interface GroundReportCreateRequest {
  /** ISO date (YYYY-MM-DD); the server resolves the week/month range. */
  zone_id: string;
  period_type: GroundReportPeriodType;
  picked_date: string;
  visibility?: GroundReportVisibility;
}

export interface GroundReportUpdateRequest {
  period_type?: GroundReportPeriodType;
  picked_date?: string;
  visibility?: GroundReportVisibility;
}

export interface GroundReportImageResponse {
  id: string;
  ground_report_id: string;
  content_type: string;
  size_bytes: number;
  lat: number;
  lng: number;
  coord_source: GroundReportCoordSource;
  accuracy_m: number | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
  /** Presigned GET URL for previewing the photo; null when storage is unconfigured. */
  url?: string | null;
}

export interface GroundReportImageListResponse {
  items: GroundReportImageResponse[];
}

/** A pending image upload with its captured coordinate. */
export interface UploadGroundReportImageInput {
  reportId: string;
  file: File;
  lat: number;
  lng: number;
  coordSource: GroundReportCoordSource;
  accuracyM?: number | null;
  caption?: string | null;
}

export interface ImageReorderRequest {
  ordered_ids: string[];
}

/** Member-facing reel payload. */
export interface MemberImageResponse {
  id: string;
  url: string;
  lat: number;
  lng: number;
  caption: string | null;
  sort_order: number;
}

export interface MemberZoneReportResponse {
  zone_id: string;
  label: string;
  precinct_keys: string[];
  report_id: string;
  period_type: GroundReportPeriodType;
  period_start: string;
  period_end: string;
  images: MemberImageResponse[];
}

export interface MemberGroundReportResponse {
  zones: MemberZoneReportResponse[];
}
