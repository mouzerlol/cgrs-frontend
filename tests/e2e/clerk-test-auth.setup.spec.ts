/**
 * Auth setup for signed-in Playwright runs — programmatic, no OAuth/UI.
 *
 * Uses a Clerk dev "test" user (`+clerk_test` email) and @clerk/testing to sign in
 * via a Backend-API ticket, then saves the session to tests/e2e/.auth/user.json
 * (the storageState used by the `chromium-authenticated` project).
 *
 * Run to (re)capture a session:
 *   export CLERK_PUBLISHABLE_KEY=$(grep '^NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=' .env.local | cut -d= -f2)
 *   export $(grep '^CLERK_SECRET_KEY=' .env.local | xargs)
 *   npx playwright test clerk-test-auth --project=chromium
 *
 * Requires env: CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY (both pk_test/sk_test dev keys).
 */
import { test as setup, expect } from '@playwright/test';
import { clerk, clerkSetup } from '@clerk/testing/playwright';

const AUTH_FILE = 'tests/e2e/.auth/user.json';
const EMAIL = 'cgrs-e2e+clerk_test@example.com';
const PASSWORD = 'Cgrs-E2E-Test-Pw-424242';

/** Ensure the dev test user exists (idempotent) so the email ticket sign-in can find it. */
async function ensureTestUser(): Promise<void> {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('CLERK_SECRET_KEY is required to ensure the test user exists');
  const res = await fetch('https://api.clerk.com/v1/users', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email_address: [EMAIL], password: PASSWORD }),
  });
  if (!res.ok) {
    const body = await res.text();
    if (!/already|taken|exists|duplicate/i.test(body)) {
      throw new Error(`Failed to create test user (${res.status}): ${body.slice(0, 200)}`);
    }
  }
}

setup('capture clerk test session', async ({ page }) => {
  setup.setTimeout(120_000);

  await ensureTestUser();
  await clerkSetup();

  await page.goto('/');
  await clerk.loaded({ page });
  await clerk.signIn({ page, emailAddress: EMAIL });

  // Confirm the session is real: a protected route no longer bounces to sign-in.
  await page.goto('/account/verification');
  await expect(page).toHaveURL(/\/account/, { timeout: 30_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
