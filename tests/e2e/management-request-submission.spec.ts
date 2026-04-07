import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Shared mock helpers
// ---------------------------------------------------------------------------

/** Intercepts the Cloudflare Turnstile script and replaces it with a stub
 *  that immediately fires the success callback with a fake token. */
async function mockTurnstile(page: import('@playwright/test').Page) {
  await page.route('https://challenges.cloudflare.com/turnstile/**', route => {
    route.fulfill({
      contentType: 'application/javascript',
      body: `
        window.turnstile = {
          render: function(container, options) {
            setTimeout(function() { options.callback('fake-token-for-testing'); }, 300);
            return 'mock-widget-id';
          },
          remove: function() {},
          getResponse: function() { return 'fake-token-for-testing'; },
          reset: function() {}
        };
      `,
    });
  });
}

/** Returns a valid API response body for a newly-created management request. */
function managementRequestSuccessBody(overrides?: { id?: string }) {
  const id = overrides?.id ?? 'TEST-00123';
  return JSON.stringify({
    request: {
      id,
      category: 'maintenance_repairs',
      full_name: 'Test User',
      email: 'test@example.com',
      linked_task_id: 'TASK-001',
      status: 'open',
      created_at: '2026-04-06T01:00:00Z',
      updated_at: '2026-04-06T01:00:00Z',
    },
    task: {
      id: 'TASK-001',
      board_id: null,
      source_request_id: id,
      title: 'Test task',
      description: 'Test description',
      status: 'todo',
      priority: 'medium',
      assignee_id: null,
      reporter_id: null,
      tags: [],
      images: [],
      comments: [],
      activity: [],
      created_at: '2026-04-06T01:00:00Z',
      updated_at: '2026-04-06T01:00:00Z',
    },
  });
}

/** Fills the required form fields with valid test data. */
async function fillForm(page: import('@playwright/test').Page) {
  await page.fill('#full_name', 'Test User');
  await page.fill('#email', 'test@example.com');
  await page.fill('#subject', 'Testing scroll-to-top after submission');
  await page.fill(
    '#description',
    'This is a test to verify the page scrolls to the top after form submission, fixing the UX bug where users saw the newsletter section instead of the confirmation card.',
  );
}

// ---------------------------------------------------------------------------
// Regression: scroll to top after submission
// ---------------------------------------------------------------------------

/**
 * Regression test for the UX bug where the page remained scrolled to the
 * newsletter/footer section after form submission instead of showing the
 * "Request Received" confirmation card at the top of the viewport.
 *
 * Fix: ManagementRequestForm.handleSubmit blurs the active element and calls
 * window.scrollTo(0, 0) before setIsSubmitted(true), preventing the browser's
 * focus-restoration algorithm from scrolling to a footer element.
 */
test.describe('Management Request - Scroll to top after submission', () => {
  test.beforeEach(async ({ page }) => {
    await mockTurnstile(page);
    await page.route('**/api/v1/management-requests', route => {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: managementRequestSuccessBody(),
      });
    });
    await page.goto('/management-request/');
    await page.waitForLoadState('networkidle');
  });

  test('scrolls to top and shows confirmation card after submission', async ({ page }) => {
    await fillForm(page);

    // Simulate a user who scrolled to the bottom of the long form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(200); // sanity check — page must actually be scrolled

    // Wait for Turnstile mock to fire its callback (300 ms delay)
    await page.waitForTimeout(600);

    await page.click('button[type="submit"]');

    // Success confirmation must appear
    await expect(page.getByText('Request Received')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('TEST-00123')).toBeVisible();

    // Page must be scrolled back to the top
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Exploratory / debugging tests (require live backend or signed-in session)
// ---------------------------------------------------------------------------

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
