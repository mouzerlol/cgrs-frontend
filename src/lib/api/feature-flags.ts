/**
 * API client for feature flags endpoints.
 */

import { getApiUrl, getServerFetchHeaders } from '@/lib/api/api-url';

export interface FeatureFlagsResponse {
  flags: Record<string, boolean>;
  updated_at: string | null;
}

export interface FeatureFlagUpdateRequest {
  id: string;
  enabled: boolean;
}

export interface FeatureFlagUpdateResponse {
  id: string;
  enabled: boolean;
  label: string;
  description: string | null;
}

/**
 * Fetch all feature flags (GET is public; optional Bearer helps gateways and matches other API calls).
 */
export async function getFeatureFlags(getToken?: () => Promise<string | null>): Promise<FeatureFlagsResponse> {
  const headers: Record<string, string> = { ...getServerFetchHeaders() };
  if (getToken) {
    const token = await getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const res = await fetch(`${getApiUrl()}/api/v1/feature-flags`, {
    cache: 'no-store',
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch feature flags: ${res.status}`);
  }

  return res.json();
}

/**
 * Update a single feature flag (requires committee member role or higher).
 */
export async function updateFeatureFlag(
  request: FeatureFlagUpdateRequest,
  getToken: () => Promise<string | null>,
): Promise<FeatureFlagUpdateResponse> {
  const token = await getToken();
  const authToken = token ?? 'dev-token';

  const res = await fetch(`${getApiUrl()}/api/v1/feature-flags`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as { detail?: string }).detail || `Failed to update feature flag: ${res.status}`);
  }

  return res.json();
}
