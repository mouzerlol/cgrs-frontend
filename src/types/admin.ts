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
