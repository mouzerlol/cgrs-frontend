/**
 * API client for the notifications domain.
 * All functions require a Clerk JWT token via getToken parameter.
 */

import { apiRequest } from './client';

const API_PATH = '/api/v1/notifications';

export interface NotificationItem {
  id: string;
  source_type: string;
  source_id: string | null;
  title: string;
  body: string;
  action_path: string;
  nav_section: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
  is_read: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadCountSectionItem {
  section: string;
  count: number;
}

export interface UnreadCountResponse {
  total: number;
  by_section: UnreadCountSectionItem[];
}

export interface MarkReadRequest {
  notification_ids?: string[];
  nav_section?: string;
}

export interface MarkReadResponse {
  marked_count: number;
}

export async function getNotifications(
  getToken: () => Promise<string | null>,
  options?: { unread_only?: boolean; limit?: number; offset?: number },
): Promise<NotificationListResponse> {
  const params = new URLSearchParams();
  if (options?.unread_only) params.set('unread_only', 'true');
  if (options?.limit !== undefined) params.set('limit', String(options.limit));
  if (options?.offset !== undefined) params.set('offset', String(options.offset));
  const qs = params.toString();
  return apiRequest<NotificationListResponse>(
    `${API_PATH}${qs ? `?${qs}` : ''}`,
    getToken,
  );
}

export async function getUnreadCount(
  getToken: () => Promise<string | null>,
): Promise<UnreadCountResponse> {
  return apiRequest<UnreadCountResponse>(`${API_PATH}/unread-count`, getToken);
}

export async function markRead(
  getToken: () => Promise<string | null>,
  payload: MarkReadRequest,
): Promise<MarkReadResponse> {
  return apiRequest<MarkReadResponse>(`${API_PATH}/mark-read`, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
