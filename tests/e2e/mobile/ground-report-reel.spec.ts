import { test, expect, type Page } from '@playwright/test';

/**
 * Real-browser verification of the Ground Report reel on a touch viewport.
 * Drives the dev-only /reel-preview harness so no auth/backend is required.
 *
 * Covers the two reported bugs:
 *  1. Swiping must work in any direction (up/left → next, down/right → prev).
 *  2. A broken image must show the fallback card, not a broken-image icon,
 *     while good images still load.
 */

const REEL = '[data-testid="ground-report-reel"]';

// Framer Motion's drag listens to pointer events, so a stepped pointer drag
// reproduces a real swipe gesture (the offset it reads is the full travel).
async function swipe(page: Page, dx: number, dy: number) {
  const box = await page.locator(REEL).boundingBox();
  if (!box) throw new Error('reel not found');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(cx + (dx * i) / steps, cy + (dy * i) / steps);
  }
  await page.mouse.up();
  // let the spring settle + AnimatePresence swap
  await page.waitForTimeout(500);
}

test.describe('Ground Report reel — mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reel-preview');
    await expect(page.locator(REEL)).toBeVisible();
    await expect(page.getByTestId('title-slide')).toBeVisible();
  });

  test('swipe left advances off the title slide to an image', async ({ page }) => {
    await swipe(page, -200, 0); // left → next
    await expect(page.getByTestId('slide-image')).toBeVisible();
  });

  test('swipe up advances and swipe down rewinds', async ({ page }) => {
    await swipe(page, 0, -200); // up → next (now on image i1)
    await expect(page.getByTestId('slide-image')).toBeVisible();
    await swipe(page, 0, 200); // down → prev (back to title)
    await expect(page.getByTestId('title-slide')).toBeVisible();
  });

  test('a broken image shows the fallback card, good images load', async ({ page }) => {
    // title → i1 (good) → i2 (broken)
    await swipe(page, -200, 0);
    const goodImg = page.getByAltText('Stage 1 photo');
    await expect(goodImg).toBeVisible();
    await expect.poll(() => goodImg.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

    await swipe(page, -200, 0); // → i2 (broken url)
    await expect(page.getByTestId('image-fallback')).toBeVisible();
    await expect(page.getByAltText('Stage 2&3 photo')).toHaveCount(0);
  });

  test('mobile control dock navigates by tap', async ({ page }) => {
    const dock = page.getByTestId('reel-mobile-dock');
    await expect(dock).toBeVisible();
    await dock.getByLabel('Next').click();
    await expect(page.getByTestId('slide-image')).toBeVisible();
  });
});
