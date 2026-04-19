/**
 * Dev auth setup for Playwright tests.
 * When DEV_AUTH_BYPASS=true, this automatically authenticates tests without Clerk.
 * 
 * Usage:
 *   Set environment variables:
 *     DEV_AUTH_BYPASS=true
 *     DEV_AUTH_API_URL=http://localhost:8000
 *   
 *   Or configure in playwright.config.ts:
 *     { ...
 *       use: {
 *         baseURL: 'http://localhost:3000',
 *         devAuthUrl: 'http://localhost:8000',
 *       }
 *     }
 */

import { test as base, type Page, type Request } from '@playwright/test';

const AUTH_FILE = 'tests/e2e/.auth/dev-user.json';

interface DevAuthResponse {
  token: string;
  expires_at: string;
  user: {
    id: string;
    user_id: string;
    email: string;
    org_id: string;
    org_role: string;
    user_role: string;
  };
}

interface DevAuthOptions {
  userId?: string;
  email?: string;
  orgId?: string;
  orgRole?: string;
  userRole?: string;
}

/**
 * Check if dev auth bypass is enabled via environment or config.
 */
function isDevAuthEnabled(): boolean {
  return process.env.DEV_AUTH_BYPASS === 'true';
}

/**
 * Get the dev auth API URL.
 */
function getDevAuthApiUrl(): string {
  return process.env.DEV_AUTH_API_URL || 'http://localhost:8000';
}

/**
 * Fetch a dev auth token from the backend.
 */
async function fetchDevAuthToken(options?: DevAuthOptions): Promise<DevAuthResponse | null> {
  if (!isDevAuthEnabled()) {
    return null;
  }

  const apiUrl = getDevAuthApiUrl();
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/dev-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      console.error('[dev-auth] Failed to fetch token:', response.statusText);
      return null;
    }

    return await response.json() as DevAuthResponse;
  } catch (error) {
    console.error('[dev-auth] Error fetching token:', error);
    return null;
  }
}

/**
 * Create a test with dev auth support.
 * Automatically authenticates via dev auth bypass if enabled.
 */
export const test = base.extend<{
  devAuth: DevAuthResponse | null;
}>({
  devAuth: async ({}, use) => {
    const devAuth = await fetchDevAuthToken();
    await use(devAuth);
  },
});

/**
 * Extended expect with dev auth awareness.
 */
export { expect } from '@playwright/test';

/**
 * Helper to set up Clerk mock for authenticated requests.
 * Call this in test.beforeEach when dev auth is enabled.
 */
export async function setupDevAuthContext(page: Page, devAuth: DevAuthResponse | null): Promise<void> {
  if (!devAuth) {
    console.log('[dev-auth] Dev auth not enabled, skipping setup');
    return;
  }

  console.log('[dev-auth] Setting up context with token for user:', devAuth.user.email);

  // Mock Clerk's getToken to return our dev token
  await page.addInitScript(({ token }: { token: string }) => {
    (window as unknown as { Clerk: { getToken: () => Promise<string> } }).Clerk = {
      getToken: () => Promise.resolve(token),
    };
  }, { token: devAuth.token });
}

/**
 * Helper to create a request fixture with dev auth headers.
 */
export async function createDevAuthRequest(request: Request): Promise<Request> {
  const devAuth = await fetchDevAuthToken();
  if (!devAuth) {
    return request;
  }

  // The request fixture doesn't support adding headers directly,
  // but we can use it for fetching token and then apply to page context
  return request;
}

/**
 * Default test options for dev auth tests.
 */
export const testOptions = {
  baseURL: 'http://localhost:3000',
};
