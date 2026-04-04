/**
 * API client for feature flags endpoints.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
 * Fetch all feature flags (public endpoint - no auth required).
 */
export async function getFeatureFlags(): Promise<FeatureFlagsResponse> {
  const res = await fetch(`${API_URL}/api/v1/feature-flags`, {
    cache: 'no-store',
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

  const res = await fetch(`${API_URL}/api/v1/feature-flags`, {
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
