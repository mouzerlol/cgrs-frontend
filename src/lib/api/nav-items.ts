/**
 * API client for navigation items endpoint.
 * Fetches server-filtered navigation items based on user role.
 */

import { isLocalApi } from '@/lib/api/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface NavItem {
  name: string;
  href: string;
  icon: string;
}

export interface NavItemsResponse {
  items: NavItem[];
  flags: Record<string, boolean>;
}

/**
 * Fetch navigation items filtered for the current user.
 * The server applies feature flags and role rules (Discussion, Management, etc.).
 * When signed in, pass Clerk `getToken` so the API can resolve membership; otherwise
 * the request is anonymous-only nav.
 */
export async function getNavItems(getToken?: () => Promise<string | null>): Promise<NavItemsResponse> {
  const headers: Record<string, string> = {};
  if (getToken) {
    const token = await getToken();
    /** Align with apiRequest: local dev can use dev-token when Clerk has no session. */
    const authToken = token ?? (isLocalApi ? 'dev-token' : null);
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
  }

  const res = await fetch(`${API_URL}/api/v1/nav-items`, {
    cache: 'no-store',
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch nav items: ${res.status}`);
  }

  return res.json();
}