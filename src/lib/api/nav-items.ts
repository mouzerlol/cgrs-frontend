/**
 * API client for navigation items endpoint.
 * Fetches server-filtered navigation items based on user role.
 */

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
 *
 * No `dev-token` fallback here, unlike `apiRequest`. On a local API that token
 * resolves to the dev bypass principal — a superadmin — so a signed-out browser
 * was being handed the signed-in nav (Discussion and Management both visible)
 * while production correctly showed neither. Nav is what tells a visitor what
 * they have access to, so it follows the real session and nothing else.
 */
export async function getNavItems(getToken?: () => Promise<string | null>): Promise<NavItemsResponse> {
  const headers: Record<string, string> = {};
  if (getToken) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
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