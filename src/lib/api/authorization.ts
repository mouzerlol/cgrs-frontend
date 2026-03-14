/**
 * API client functions for authorization endpoints.
 * All functions require a Clerk JWT token via getToken parameter.
 */

import { apiRequest } from './client';
import type {
  CapabilityResponse,
  MemberSummaryResponse,
  PromotionResponse,
} from '@/types/authorization';

const API_PATH = '/api/v1/authz';

export async function getMyCapabilities(getToken: () => Promise<string | null>): Promise<CapabilityResponse> {
  return apiRequest<CapabilityResponse>(`${API_PATH}/capabilities/me`, getToken);
}

export async function getMembers(getToken: () => Promise<string | null>): Promise<MemberSummaryResponse[]> {
  return apiRequest<MemberSummaryResponse[]>(`${API_PATH}/members`, getToken);
}

export async function getMember(memberId: string, getToken: () => Promise<string | null>): Promise<MemberSummaryResponse> {
  return apiRequest<MemberSummaryResponse>(`${API_PATH}/members/${memberId}`, getToken);
}

export async function promoteMember(
  memberId: string,
  role: string,
  getToken: () => Promise<string | null>,
): Promise<PromotionResponse> {
  return apiRequest<PromotionResponse>(`${API_PATH}/members/${memberId}/promotions`, getToken, {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
}
