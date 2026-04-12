/**
 * API client functions for admin users endpoints.
 * All functions require a Clerk JWT token via getToken parameter.
 */

import { apiRequest } from './client';
import type { AdminUsersListResponse } from '@/types/admin';

const API_PATH = '/api/v1/users';

export async function getAdminUsers(getToken: () => Promise<string | null>): Promise<AdminUsersListResponse> {
  return apiRequest<AdminUsersListResponse>(`${API_PATH}/`, getToken);
}
