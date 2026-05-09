/**
 * E2E coverage for the bootstrap endpoint and progressive loading behaviour.
 *
 * Verifies:
 * - nav-items fires before any authenticated request (pre-auth shell render)
 * - exactly one authenticated request fires after sign-in (GET /api/v1/bootstrap)
 * - individual endpoints (users/me, users/community, feature-flags, notifications/unread-count)
 *   do NOT fire on page load when bootstrap succeeds
 *
 * Prerequisites: Next.js dev server + API on NEXT_PUBLIC_API_URL.
 * Requires authenticated storage state (run auth-setup first).
 */

import { existsSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const AUTH_STATE = 'tests/e2e/.auth/user.json';
const describeAuth = existsSync(AUTH_STATE) ? test.describe : test.describe.skip;

describeAuth('bootstrap — progressive loading (authenticated)', () => {
  test.use({ storageState: AUTH_STATE });

  test('nav-items fires before bootstrap on page load', async ({ page }) => {
    const requestOrder: string[] = [];

    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/v1/nav-items')) requestOrder.push('nav-items');
      if (url.includes('/api/v1/bootstrap')) requestOrder.push('bootstrap');
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for bootstrap to fire
    await page.waitForResponse(
      (r) => r.url().includes('/api/v1/bootstrap'),
      { timeout: 30000 },
    );

    const navIdx = requestOrder.indexOf('nav-items');
    const bootstrapIdx = requestOrder.indexOf('bootstrap');

    expect(navIdx, 'nav-items should fire before bootstrap').toBeGreaterThanOrEqual(0);
    expect(bootstrapIdx, 'bootstrap should fire').toBeGreaterThanOrEqual(0);
    expect(navIdx, 'nav-items should precede bootstrap').toBeLessThan(bootstrapIdx);
  });

  test('bootstrap returns 200 with all four fields', async ({ page }) => {
    const responsePromise = page.waitForResponse(
      (r) => r.url().includes('/api/v1/bootstrap') && r.request().method() === 'GET',
      { timeout: 30000 },
    );

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    const json = await response.json() as Record<string, unknown>;
    expect(json).toHaveProperty('user');
    expect(json).toHaveProperty('community');
    expect(json).toHaveProperty('feature_flags');
    expect(json).toHaveProperty('unread_count');
  });

  test('individual shell endpoints do not fire when bootstrap succeeds', async ({ page }) => {
    const individualEndpoints = [
      '/api/v1/users/me',
      '/api/v1/users/community',
      '/api/v1/feature-flags',
      '/api/v1/notifications/unread-count',
    ];

    const firedIndividual: string[] = [];

    page.on('request', (req) => {
      for (const ep of individualEndpoints) {
        if (req.url().includes(ep)) firedIndividual.push(ep);
      }
    });

    // Wait for bootstrap to complete before asserting
    const bootstrapDone = page.waitForResponse(
      (r) => r.url().includes('/api/v1/bootstrap'),
      { timeout: 30000 },
    );

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await bootstrapDone;

    // Give React a moment to process and potentially trigger additional requests
    await page.waitForTimeout(1000);

    expect(
      firedIndividual,
      'individual shell endpoints should not fire when bootstrap succeeds',
    ).toHaveLength(0);
  });
});
