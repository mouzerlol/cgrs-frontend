/**
 * API client functions for verification endpoints.
 * All functions require a Clerk JWT token via getToken parameter.
 */

import { apiRequest } from './client';

const API_PATH = '/api/v1/properties';

export interface StreetResponse {
  id: string;
  name: string;
  created_at: string;
}

export interface AddressLookupResponse {
  property_exists: boolean;
  property_id: string | null;
  street_name: string;
  street_number: string;
  has_verified_members: boolean;
  has_residents: boolean;
  has_owners: boolean;
  verification_status: string;
  pending_request: Record<string, unknown> | null;
}

export interface VerificationRequestCreate {
  street_id: string;
  street_number: string;
  verification_type: 'resident' | 'owner';
}

export interface VerificationRequestResponse {
  verification_method: string;
  property_id: string;
  request_id: string | null;
  status: string;
  qr_image_data: string | null;
  expires_at: string | null;
}

export interface QRScanResponse {
  success: boolean;
  property_id: string;
  role_assigned: string;
}

export interface PendingRequestItem {
  id: string;
  property_id: string;
  verification_type: string;
  status: string;
  created_at: string;
}

export interface PendingResponseItem {
  id: string;
  property_id: string;
  street_name: string;
  street_number: string;
  verification_type: string;
  requester_name: string | null;
  requester_email: string | null;
  created_at: string;
}

export interface PendingVerificationsResponse {
  my_pending_requests: PendingRequestItem[];
  pending_responses: PendingResponseItem[];
}

export interface VerificationHistoryItem {
  id: string;
  property_id: string;
  street_name: string;
  street_number: string;
  verification_type: string;
  method: string;
  outcome: string;
  created_at: string;
}

export interface NotificationCountResponse {
  count: number;
}

export interface VerificationStatusResponse {
  is_verified: boolean;
  role: string | null;
  has_pending_request: boolean;
  pending_address: string | null;
  pending_type: string | null;
}

export interface VerifiedPropertyItem {
  property_id: string;
  street_name: string;
  street_number: string;
  verification_type: string;
  verified_at: string;
  unit_number: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking_spaces: number | null;
  lat: number | null;
  lng: number | null;
  image_url: string | null;
}

export interface MyPropertiesResponse {
  verified_properties: VerifiedPropertyItem[];
  pending_requests: PendingRequestItem[];
}

export interface PropertyUpdate {
  unit_number?: string | null;
  property_type?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking_spaces?: number | null;
  lat?: number | null;
  lng?: number | null;
  image_url?: string | null;
}

export interface GeocodeRequest {
  street_name: string;
  street_number: string;
  suburb?: string | null;
  city?: string | null;
  postcode?: string | null;
}

export interface GeocodeResponse {
  lat: number;
  lng: number;
  formatted_address: string | null;
}

export async function getStreets(getToken: () => Promise<string | null>): Promise<StreetResponse[]> {
  return apiRequest<StreetResponse[]>(`${API_PATH}/streets`, getToken);
}

export async function lookupAddress(
  payload: VerificationRequestCreate,
  getToken: () => Promise<string | null>,
): Promise<AddressLookupResponse> {
  return apiRequest<AddressLookupResponse>(`${API_PATH}/addresses/lookup`, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createVerificationRequest(
  payload: VerificationRequestCreate,
  getToken: () => Promise<string | null>,
): Promise<VerificationRequestResponse> {
  return apiRequest<VerificationRequestResponse>(`${API_PATH}/verification/request`, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function scanQRCode(
  token: string,
  getToken: () => Promise<string | null>,
): Promise<QRScanResponse> {
  return apiRequest<QRScanResponse>(`${API_PATH}/verification/scan/${token}`, getToken, {
    method: 'POST',
  });
}

export async function getPendingVerifications(
  getToken: () => Promise<string | null>,
): Promise<PendingVerificationsResponse> {
  return apiRequest<PendingVerificationsResponse>(`${API_PATH}/verification/pending`, getToken);
}

export async function respondToVerification(
  requestId: string,
  approved: boolean,
  getToken: () => Promise<string | null>,
): Promise<{ success: boolean; request_id: string; approved: boolean }> {
  return apiRequest(`${API_PATH}/verification/${requestId}/respond`, getToken, {
    method: 'POST',
    body: JSON.stringify({ approved }),
  });
}

export async function getVerificationHistory(
  getToken: () => Promise<string | null>,
): Promise<VerificationHistoryItem[]> {
  return apiRequest<VerificationHistoryItem[]>(`${API_PATH}/verification/history`, getToken);
}

export async function getNotificationCount(
  getToken: () => Promise<string | null>,
): Promise<NotificationCountResponse> {
  return apiRequest<NotificationCountResponse>(`${API_PATH}/verification/notifications/count`, getToken);
}

export async function getVerificationStatus(
  getToken: () => Promise<string | null>,
): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>(`${API_PATH}/verification/status`, getToken);
}

export async function getMyProperties(
  getToken: () => Promise<string | null>,
): Promise<MyPropertiesResponse> {
  return apiRequest<MyPropertiesResponse>(`${API_PATH}/my-properties`, getToken);
}

export async function withdrawVerificationRequest(
  requestId: string,
  getToken: () => Promise<string | null>,
): Promise<{ success: boolean; request_id: string }> {
  return apiRequest(`${API_PATH}/verification/${requestId}`, getToken, {
    method: 'DELETE',
  });
}
