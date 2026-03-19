/**
 * TypeScript types for authorization API responses.
 * Matches backend Pydantic schemas in modules/authorization/api/schemas.py
 */

export type RoleEnum = 'contact' | 'resident' | 'owner' | 'society_manager' | 'committee_member' | 'committee_chairperson';

export interface CapabilityResponse {
  role: RoleEnum | null;
  is_superadmin: boolean;
  capabilities: string[];
}

export interface MemberUserResponse {
  id: string;
  clerk_user_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

export interface MemberSummaryResponse {
  id: string;
  community_id: string;
  user_id: string;
  role: RoleEnum;
  created_at: string;
  user: MemberUserResponse;
}

export interface PromotionRequest {
  role: RoleEnum;
}

export interface PromotionResponse {
  member: MemberSummaryResponse;
}
