/**
 * API client for the society registration record.
 * GET is gated to owners-and-up; PUT requires the editSocietyRecord capability.
 */

import { apiRequest } from '@/lib/api/client';

export type SocietyStatus = 'registered' | 'removed' | 'dissolved';

/** Backend returns snake_case via Pydantic. */
export interface SocietyRecordResponse {
  legal_name: string;
  has_more_than_ten_members: boolean;
  nzbn: string;
  incorporation_number: string;
  status: string;
  date_of_incorporation: string | null;
  date_of_reregistration: string | null;
  governing_act: string;
  registered_office_address: string;
  registered_office_start_date: string | null;
  companies_office_url: string | null;
  is_recorded: boolean;
  updated_at: string | null;
  updated_by: string | null;
}

export interface SocietyRecordUpdateRequest {
  legal_name: string;
  has_more_than_ten_members: boolean;
  nzbn: string;
  incorporation_number: string;
  status: SocietyStatus;
  date_of_incorporation: string;
  date_of_reregistration: string | null;
  governing_act: string;
  registered_office_address: string;
  registered_office_start_date: string;
  companies_office_url: string | null;
}

/** Fetch the society registration record (owners-and-up only). */
export async function getSocietyRecord(
  getToken: () => Promise<string | null>,
): Promise<SocietyRecordResponse> {
  return apiRequest<SocietyRecordResponse>('/api/v1/society/record', getToken);
}

/** Replace the society registration record (requires editSocietyRecord). */
export async function updateSocietyRecord(
  body: SocietyRecordUpdateRequest,
  getToken: () => Promise<string | null>,
): Promise<SocietyRecordResponse> {
  return apiRequest<SocietyRecordResponse>('/api/v1/society/record', getToken, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
