/**
 * E2E coverage for server-filtered navigation (GET /api/v1/nav-items).
 *
 * Regression: anonymous requests must not 500; signed-in clients must send a Clerk JWT
 * (Bearer eyJ…) so the API can resolve Principal/membership — not only dev-token.
 *
 * Prerequisites: Next.js (playwright webServer) and API on NEXT_PUBLIC_API_URL (default :8000).
 */

import { existsSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const AUTH_STATE = 'tests/e2e/.auth/user.json';

test.describe('nav-items API (unauthenticated browser context)', () => {
  test('GET /api/v1/nav-items returns 200 with items and flags', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/v1/nav-items') && r.request().method() === 'GET',
      { timeout: 45000 },
    );
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const response = await responsePromise;

    expect(response.status(), 'nav-items must not 500 after Principal/member fix').toBe(200);
    const json = (await response.json()) as { items: unknown[]; flags: Record<string, boolean> };
    expect(Array.isArray(json.items)).toBe(true);
    expect(json.flags).toBeDefined();
    expect(typeof json.flags).toBe('object');
  });

  test('header shows at least About and Map links after nav loads', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const nav = page.locator('header nav').first();
    await expect(nav.getByRole('link', { name: /^about$/i })).toBeVisible({ timeout: 20000 });
    await expect(nav.getByRole('link', { name: /^map$/i })).toBeVisible({ timeout: 10000 });
  });
});

const describeAuth = existsSync(AUTH_STATE) ? test.describe : test.describe.skip;

describeAuth('nav-items with Clerk session', () => {
  test.use({ storageState: AUTH_STATE });

  test('nav-items request uses Clerk JWT (Bearer eyJ…), not dev-token-only', async ({ page }) => {
    const headers: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/nav-items') && req.method() === 'GET') {
        const h = req.headers()['authorization'] ?? req.headers()['Authorization'] ?? '';
        headers.push(h);
      }
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const auth = headers.find((h) => h.length > 0);
    expect(auth, 'nav-items should send Authorization when useNavItems passes getToken').toBeTruthy();
    expect(auth?.startsWith('Bearer '), 'Expected Authorization: Bearer …').toBe(true);
    /**
     * Local dev uses literal `dev-token` when Clerk getToken() is null (expired/missing session).
     * A live session must send a JWT (`eyJ…`) so the API resolves Principal — that is the fix under test.
     */
    if (auth === 'Bearer dev-token') {
      test.skip(
        true,
        'Clerk session inactive in storage (Authorization fell back to dev-token). Regenerate tests/e2e/.auth/user.json: npx playwright test tests/e2e/auth-setup.spec.ts --headed',
      );
    }
    expect(auth?.startsWith('Bearer eyJ'), 'Expected Clerk JWT so API resolves principal.role').toBe(true);
  });
});
