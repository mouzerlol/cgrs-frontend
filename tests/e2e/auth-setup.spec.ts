/**
 * One-time setup to capture auth state for signed-in tests.
 * Run: npx playwright test auth-setup --headed
 * Sign in when the browser opens, then the state is saved to .auth/user.json
 */
import { test as setup } from '@playwright/test';

const AUTH_FILE = 'tests/e2e/.auth/user.json';

setup('capture auth state', async ({ page }) => {
  await page.goto('/management-request/');
  await page.waitForLoadState('networkidle');

  const signInBtn = page.locator('text=Resident Login').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForURL(/sign-in|login|accounts\.dev/);
    // Wait up to 90s for manual sign-in, then redirect back to form
    await page.waitForURL(/management-request|localhost:3000/, { timeout: 90000 });
  }

  await page.context().storageState({ path: AUTH_FILE });
});
