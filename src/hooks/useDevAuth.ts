/**
 * Hook for dev auth bypass initialization.
 * When NEXT_PUBLIC_DEV_AUTH_BYPASS=true, this hook initializes
 * the dev auth session and provides utilities for testing.
 */

import { useEffect, useState } from 'react';

import { clearCachedDevAuthToken, fetchDevAuthToken, isDevAuthEnabled, type DevAuthToken } from '@/lib/dev-auth';

/**
 * Initialize dev auth bypass. Call this early in the app lifecycle.
 * Returns the dev auth token if enabled and successfully fetched.
 */
export function useDevAuthInitialization(): DevAuthToken | null {
  const [token, setToken] = useState<DevAuthToken | null>(null);

  useEffect(() => {
    if (!isDevAuthEnabled()) {
      return;
    }

    // Fetch the dev auth token on mount
    fetchDevAuthToken().then((devToken) => {
      if (devToken) {
        console.log('[dev-auth] Initialized with user:', devToken.user.email, 'role:', devToken.user.userRole);
        setToken(devToken);
      }
    });
  }, []);

  return token;
}

/**
 * Hook to get the current dev auth token.
 * Refreshes automatically when expired.
 */
export function useDevAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isDevAuthEnabled()) {
      return;
    }

    const updateToken = async () => {
      const devToken = await fetchDevAuthToken();
      if (devToken) {
        setToken(devToken.token);
      }
    };

    updateToken();

    // Refresh token every 5 minutes
    const interval = setInterval(updateToken, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return token;
}

/**
 * Hook to logout from dev auth.
 * Clears the cached token.
 */
export function useDevAuthLogout(): () => void {
  return () => {
    clearCachedDevAuthToken();
    // Reload to reset all state
    window.location.reload();
  };
}
