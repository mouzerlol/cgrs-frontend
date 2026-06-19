/**
 * TypeScript types for admin users API responses.
 * Matches backend Pydantic schemas in modules/users/api/schemas.py
 */

export type RoleEnum = 'contact' | 'resident' | 'owner' | 'society_manager' | 'committee_member' | 'committee_chairperson';

export interface AdminUserResponse {
  id: string;
  name: string;
  avatar_url: string | null;
  email: string | null;
  role: RoleEnum;
  member_since: string;
  last_login: string | null;
  pending_verification_count: number;
}

export interface AdminUsersListResponse {
  users: AdminUserResponse[];
  total: number;
}

export type ResidentTypeEnum = 'tenant' | 'owner';

export interface AdminSignatureResponse {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  resident_type: ResidentTypeEnum;
  address: string | null;
  ip_address: string | null;
  email_updates_consent: boolean;
  consent_recorded_at: string | null;
  signed_at: string;
}

export type SignatureSortField = 'name' | 'email' | 'resident_type' | 'signed_at';
export type SignatureSortOrder = 'asc' | 'desc';

export interface AdminSignaturesListResponse {
  signatures: AdminSignatureResponse[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

// --- Society documents ---
// Matches backend Pydantic schemas in modules/society_documents/api/schemas.py

export type SocietyDocumentStatus = 'pending' | 'ready';
export type SocietyDocumentSource = 'manual_upload' | 'external';

/** Compact category identity embedded on a document response. */
export interface EmbeddedCategory {
  id: string;
  label: string;
  is_visible: boolean;
}

export interface SocietyDocumentCategory {
  id: string;
  community_id: string;
  label: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocietyDocumentCategoryListResponse {
  items: SocietyDocumentCategory[];
}

export interface SocietyDocumentResponse {
  id: string;
  community_id: string;
  title: string;
  category_id: string | null;
  category: EmbeddedCategory | null;
  description: string | null;
  display_name: string;
  content_type: string;
  size_bytes: number;
  status: string;
  visibility: number;
  source: string;
  external_id: string | null;
  external_modified_at: string | null;
  content_hash: string | null;
  last_synced_at: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocietyDocumentListResponse {
  items: SocietyDocumentResponse[];
  limit: number;
  offset: number;
}

export interface SocietyDocumentUpdateRequest {
  title?: string;
  category_id?: string | null;
  description?: string;
  visibility?: number;
}

export interface SocietyDocumentDownloadUrlResponse {
  download_url: string;
  expires_in_seconds: number;
}

/**
 * Member-facing document metadata (owners-and-up). Leaner than
 * SocietyDocumentResponse: no storage key, source, or sync fields.
 */
export interface VisibleSocietyDocument {
  id: string;
  title: string;
  description: string | null;
  display_name: string;
  content_type: string;
  size_bytes: number;
  visibility: number;
  created_at: string;
  updated_at: string;
}

export interface VisibleSocietyCategoryGroup {
  id: string;
  label: string;
  documents: VisibleSocietyDocument[];
}

/** Response of `GET /society-documents:visible` — visible categories, grouped. */
export interface VisibleSocietyDocumentsResponse {
  categories: VisibleSocietyCategoryGroup[];
}
