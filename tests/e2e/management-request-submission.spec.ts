import { test, expect } from '@playwright/test';

/**
 * Management request form submission test.
 * Fills the form, submits, and captures API response for debugging.
 */
test.describe('Management Request - Form Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/management-request/');
    await page.waitForLoadState('networkidle');
  });

  test('should display form and allow fill + submit (anonymous)', async ({ page }) => {
    await expect(page.locator('#full_name')).toBeVisible();

    await page.fill('#full_name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#subject', 'Test subject for debugging');
    await page.fill(
      '#description',
      'This is a test description that meets the minimum length requirement of twenty characters'
    );

    const apiResponsePromise = page
      .waitForResponse(
        (res) => res.url().includes('/api/v1/management-requests') && res.request().method() === 'POST',
        { timeout: 10000 }
      )
      .catch(() => null);

    await page.click('button[type="submit"]');

    const apiResponse = await apiResponsePromise;
    if (apiResponse) {
      const status = apiResponse.status();
      const headers = apiResponse.headers();
      const body = await apiResponse.text();
      const hasCorsOrigin = headers['access-control-allow-origin'];
      console.log('API Response:', { status, hasCorsOrigin, body: body.slice(0, 300) });
      if (status === 500) {
        expect(hasCorsOrigin, '500 response should include CORS header').toBeTruthy();
      }
    } else {
      const errorText = await page.locator('text=Please sign in').first().textContent().catch(() => null);
      if (errorText) {
        console.log('Anonymous user: form showed sign-in prompt, no API call');
      }
    }
  });

  test('signed-in user: submit and capture API response', async ({ page }) => {
    // Requires user to be signed in. Run with: npx playwright test management-request-submission --headed
    // Sign in first at /login if needed, then this test will submit.
    await expect(page.locator('#full_name')).toBeVisible();

    await page.fill('#full_name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#subject', 'Test subject for debugging');
    await page.fill(
      '#description',
      'This is a test description that meets the minimum length requirement of twenty characters'
    );

    const apiResponsePromise = page
      .waitForResponse(
        (res) => res.url().includes('/api/v1/management-requests') && res.request().method() === 'POST',
        { timeout: 15000 }
      )
      .catch(() => null);

    await page.click('button[type="submit"]');

    const apiResponse = await apiResponsePromise;
    if (!apiResponse) {
      test.skip(true, 'No API call - user may not be signed in. Sign in at /login and re-run.');
    }

    const status = apiResponse!.status();
    const headers = apiResponse!.headers();
    const body = await apiResponse!.text();
    const hasCorsOrigin = headers['access-control-allow-origin'];

    console.log('API Response:', { status, hasCorsOrigin, body: body.slice(0, 500) });

    if (status === 500) {
      expect(hasCorsOrigin, '500 response must include CORS header for browser to read it').toBeTruthy();
    }
    expect([200, 201, 400, 401, 403, 500]).toContain(status);
  });
});
