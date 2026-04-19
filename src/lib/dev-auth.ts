/**
 * Dev auth bypass utilities for testing without Clerk.
 * When NEXT_PUBLIC_DEV_AUTH_BYPASS=true, provides mock authentication
 * that works without Clerk interaction.
 */

const DEV_AUTH_BYPASS = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true';
const DEV_AUTH_API_URL = process.env.NEXT_PUBLIC_DEV_AUTH_API_URL || 'http://localhost:8000';

export interface DevAuthConfig {
  enabled: boolean;
  apiUrl: string;
}

export interface DevAuthToken {
  token: string;
  expiresAt: Date;
  user: {
    id: string;
    userId: string;
    email: string;
    orgId: string;
    orgRole: string;
    userRole: string;
  };
}

/**
 * Check if dev auth bypass is enabled.
 */
export function isDevAuthEnabled(): boolean {
  return DEV_AUTH_BYPASS;
}

/**
 * Get dev auth configuration.
 */
export function getDevAuthConfig(): DevAuthConfig {
  return {
    enabled: DEV_AUTH_BYPASS,
    apiUrl: DEV_AUTH_API_URL,
  };
}

/**
 * Fetch a dev auth token from the backend.
 * Returns null if dev auth is not enabled or if the request fails.
 */
export async function fetchDevAuthToken(
  overrides?: Partial<{
    userId: string;
    email: string;
    orgId: string;
    orgRole: string;
    userRole: string;
  }>,
): Promise<DevAuthToken | null> {
  if (!DEV_AUTH_BYPASS) {
    return null;
  }

  try {
    const response = await fetch(`${DEV_AUTH_API_URL}/api/v1/auth/dev-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(overrides || {}),
    });

    if (!response.ok) {
      console.error('[dev-auth] Failed to fetch dev auth token:', response.statusText);
      return null;
    }

    const data = await response.json();

    return {
      token: data.token,
      expiresAt: new Date(data.expires_at),
      user: {
        id: data.user.id,
        userId: data.user.user_id,
        email: data.user.email,
        orgId: data.user.org_id,
        orgRole: data.user.org_role,
        userRole: data.user.user_role,
      },
    };
  } catch (error) {
    console.error('[dev-auth] Error fetching dev auth token:', error);
    return null;
  }
}

/**
 * Check if a dev auth token is expired.
 */
export function isDevAuthTokenExpired(token: DevAuthToken): boolean {
  return new Date() >= token.expiresAt;
}

// Cached token for the duration of a page session
let cachedDevAuthToken: DevAuthToken | null = null;

/**
 * Get a cached dev auth token, fetching a new one if needed.
 */
export async function getDevAuthToken(): Promise<string | null> {
  if (!DEV_AUTH_BYPASS) {
    return null;
  }

  // Return cached token if valid
  if (cachedDevAuthToken && !isDevAuthTokenExpired(cachedDevAuthToken)) {
    return cachedDevAuthToken.token;
  }

  // Fetch a new token
  const newToken = await fetchDevAuthToken();
  if (newToken) {
    cachedDevAuthToken = newToken;
    return newToken.token;
  }

  return null;
}

/**
 * Clear the cached dev auth token (e.g., on logout).
 */
export function clearCachedDevAuthToken(): void {
  cachedDevAuthToken = null;
}
