/**
 * TypeScript types for authorization API responses.
 * Matches backend Pydantic schemas in modules/authorization/api/schemas.py
 */

export type RoleEnum = 'contact' | 'resident' | 'owner' | 'society_manager' | 'committee_member' | 'committee_chairperson';

export interface CapabilityResponse {
  role: RoleEnum | null;
  isSuperadmin: boolean;
  capabilities: string[];
}

export interface MemberUserResponse {
  id: string;
  clerkUserId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
}

export interface MemberSummaryResponse {
  id: string;
  communityId: string;
  userId: string;
  role: RoleEnum;
  createdAt: string;
  user: MemberUserResponse;
}

export interface PromotionRequest {
  role: RoleEnum;
}

export interface PromotionResponse {
  member: MemberSummaryResponse;
}
