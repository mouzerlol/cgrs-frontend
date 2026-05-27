import { test, expect } from '@playwright/test';

/**
 * E2E for the cold-start banner. These tests require the banner to be enabled
 * in the dev server's env (`NEXT_PUBLIC_COLD_START_BANNER_ENABLED=true`) AND
 * the current Auckland time to fall inside the sleep window OR the soft
 * request-watcher to be triggerable by stalling a non-/health request.
 *
 * The intended way to run them locally:
 *
 *   NEXT_PUBLIC_COLD_START_BANNER_ENABLED=true \
 *   NEXT_PUBLIC_SLEEP_WINDOW_START_HOUR=0 \
 *   NEXT_PUBLIC_SLEEP_WINDOW_END_HOUR=23 \
 *   npm run test:e2e -- tests/e2e/cold-start-banner.spec.ts
 *
 * (The two SLEEP_WINDOW overrides force the sleep window to cover all hours so
 * the test runs predictably regardless of when it is run.)
 */

test.describe('Cold-start banner', () => {
  test.fixme(
    !process.env.NEXT_PUBLIC_COLD_START_BANNER_ENABLED,
    'Banner is gated by NEXT_PUBLIC_COLD_START_BANNER_ENABLED. Set the env var to run these.',
  );

  test('shows the banner when /health stalls, then dismisses after /health resolves', async ({
    page,
  }) => {
    // Stall /health for 4s, then resolve. The banner should appear after the
    // 250ms grace window, then disappear after the resolution beat completes.
    let resolveHealth: (() => void) | undefined;
    const healthGate = new Promise<void>((r) => {
      resolveHealth = r;
    });

    await page.route('**/health', async (route) => {
      await healthGate;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'healthy', version: 'test' }),
      });
    });

    await page.goto('/');

    // Banner appears after the 250ms grace window.
    const banner = page.locator('[data-cold-start-banner]');
    await expect(banner).toBeVisible({ timeout: 2_000 });

    // The Why link points at /sustainability.
    const whyLink = banner.getByRole('link', { name: /why/i });
    await expect(whyLink).toHaveAttribute('href', '/sustainability');

    // Release /health. Banner should dismiss within a couple of seconds (300ms
    // stripe complete + 600ms hold + 100ms fade).
    resolveHealth?.();
    await expect(banner).toBeHidden({ timeout: 3_000 });

    // Navigation should have re-mounted (look for a known nav link).
    await expect(page.getByRole('link', { name: /home/i }).first()).toBeVisible();
  });

  test('Why link from the banner navigates to /sustainability', async ({ page }) => {
    await page.route('**/health', (route) => {
      // Never resolve, keeping the banner visible long enough to click.
      return new Promise(() => {});
    });

    await page.goto('/');
    const banner = page.locator('[data-cold-start-banner]');
    await expect(banner).toBeVisible({ timeout: 2_000 });

    await banner.getByRole('link', { name: /why/i }).click();
    await expect(page).toHaveURL(/\/sustainability\/?$/);
  });
});
