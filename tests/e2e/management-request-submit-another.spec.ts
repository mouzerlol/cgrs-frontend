import { test, expect } from '@playwright/test';

/**
 * Regression: clicking "Submit Another" after a successful submission must keep
 * the signed-in user's name and email prefilled (they were being blanked out).
 *
 * Runs under the authenticated project (storageState) so useUser() returns a
 * real Clerk session and the contact fields are prefilled from it.
 */

function managementRequestSuccessBody(id = 'TEST-SA-001') {
  return JSON.stringify({
    request: {
      id,
      category: 'maintenance_repairs',
      full_name: 'Test User',
      email: 'test@example.com',
      linked_task_id: 'TASK-SA-1',
      status: 'open',
      created_at: '2026-06-25T01:00:00Z',
      updated_at: '2026-06-25T01:00:00Z',
    },
    task: {
      id: 'TASK-SA-1',
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
      created_at: '2026-06-25T01:00:00Z',
      updated_at: '2026-06-25T01:00:00Z',
    },
  });
}

test.describe('Management Request - Submit Another keeps user details', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // Verified user → no captcha; name/email render from the Clerk session.
    await page.route('**/api/v1/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ requires_captcha: false }),
      });
    });
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

  test('name and email persist after Submit Another', async ({ page }) => {
    const nameEl = page.locator('#full_name');
    const emailEl = page.locator('#email');

    // Wait for the Clerk prefill to populate the contact fields.
    await expect.poll(async () => (await nameEl.textContent())?.trim() || '').not.toBe('');
    const name = (await nameEl.textContent())?.trim() ?? '';
    const email = (await emailEl.textContent())?.trim() ?? '';
    expect(name).not.toBe('');
    expect(email).not.toBe('');

    await page.fill('#subject', 'Broken gate latch by the carpark');
    await page.fill(
      '#description',
      'The front gate latch is broken and will not close properly, leaving the carpark unsecured.',
    );

    await page.click('button[type="submit"]');
    await expect(page.getByText('Request Received')).toBeVisible({ timeout: 8000 });

    await page.getByRole('button', { name: /Submit Another/i }).click();

    // Back on a fresh form — contact details must still be there.
    await expect(page.locator('#subject')).toBeVisible();
    await expect(nameEl).toHaveText(name);
    await expect(emailEl).toHaveText(email);
  });
});
