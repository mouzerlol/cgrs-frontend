import { test, expect } from '@playwright/test';

/**
 * E2E for the "share a point on the map" feature.
 *
 * Covers:
 * - Deep-link landing: /map?lat&lng lands at max zoom with a pin + share card
 * - Per-link Open Graph metadata + canonical tag rendered server-side
 * - Author flow: arm Share → click to drop pin + card → reposition → Copy/Esc disarm
 */

// A point inside the development (Huri Street precinct area).
const LAT = -36.94946;
const LNG = 174.79053;

test.describe('Map location sharing — consume (deep link)', () => {
  test('landing on /map?lat&lng shows the pin and share card', async ({ page }) => {
    await page.goto(`/map?lat=${LAT}&lng=${LNG}&from=share`);
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    // The CG seal pin is dropped for the shared point.
    await expect(page.locator('.cg-seal').first()).toBeVisible({ timeout: 10000 });

    // The share card is shown (view variant for from=share).
    const card = page.locator('.share-card');
    await expect(card).toBeVisible();
    await expect(card.locator('.share-card-title')).toHaveText('Shared location');

    // The URL field carries the coordinates.
    const url = await card.locator('.share-card-url').inputValue();
    expect(url).toContain(`lat=${LAT}`);
    expect(url).toContain(`lng=${LNG}`);
  });

  test('the share card has a close button that dismisses card + pin', async ({ page }) => {
    await page.goto(`/map?lat=${LAT}&lng=${LNG}&from=share`);
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await expect(page.locator('.share-card')).toBeVisible();

    const close = page.locator('.share-card-close');
    await expect(close).toBeVisible();
    await close.click();

    await expect(page.locator('.share-card')).toHaveCount(0);
    await expect(page.locator('.cg-seal')).toHaveCount(0);
  });

  test('panning after a shared landing clears lat/lng/from from the URL', async ({ page }) => {
    await page.goto(`/map?lat=${LAT}&lng=${LNG}&from=share`);
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await expect(page.locator('.share-card')).toBeVisible();
    expect(page.url()).toContain('lat=');

    // Let the immersive auto-scroll settle, then recompute coords so the drag lands
    // on the map (a user-initiated state change).
    const map = page.locator('.interactive-map');
    await map.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const box = (await map.boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 120, cy - 90, { steps: 8 });
    await page.mouse.move(cx - 160, cy - 120, { steps: 4 });
    await page.mouse.up();

    await expect.poll(() => new URL(page.url()).search).not.toContain('lat');
    const u = new URL(page.url());
    expect(u.searchParams.has('lat')).toBe(false);
    expect(u.searchParams.has('lng')).toBe(false);
    expect(u.searchParams.has('from')).toBe(false);
  });

  test('invalid params fall back to the default overview (no card)', async ({ page }) => {
    await page.goto('/map?lat=abc&lng=999');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await expect(page.locator('.share-card')).toHaveCount(0);
  });

  test('shared link renders per-coordinate OG + canonical server-side', async ({ request }) => {
    const res = await request.get(`/map?lat=${LAT}&lng=${LNG}`);
    const html = await res.text();
    expect(html).toContain('property="og:title"');
    expect(html).toMatch(/rel="canonical"[^>]*href="[^"]*\/map\/?"/);
  });
});

test.describe('Map location sharing — author (placement mode)', () => {
  test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

  test('arm, place, reposition, and disarm via Copy and Escape', async ({ page }) => {
    await page.goto('/map');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });

    const shareBtn = page.locator('.leaflet-control-share-button');
    await expect(shareBtn).toBeVisible();

    // Arm placement mode → banner appears, button active.
    await shareBtn.click();
    await expect(page.locator('.share-banner')).toBeVisible();
    await expect(shareBtn).toHaveClass(/is-active/);

    // Click the map to drop a pin + open the card.
    const map = page.locator('.interactive-map');
    const box = (await map.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('.share-card')).toBeVisible();
    await expect(page.locator('.cg-seal')).toHaveCount(1);

    // Reposition: a second click keeps a single pin and stays armed.
    await page.mouse.click(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40);
    await expect(page.locator('.cg-seal')).toHaveCount(1);
    await expect(page.locator('.share-banner')).toBeVisible();

    // Copy disarms (banner gone) AND closes the card itself; the pin persists.
    await page.locator('.share-card-copy').click();
    await expect(page.locator('.share-banner')).toHaveCount(0);
    await expect(page.locator('.share-card')).toHaveCount(0);
    await expect(page.locator('.cg-seal')).toHaveCount(1);

    // Re-arm and place again, then Escape disarms (card stays — only the mode ends).
    await shareBtn.click();
    await expect(page.locator('.share-banner')).toBeVisible();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator('.share-card')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.share-banner')).toHaveCount(0);
    await expect(page.locator('.share-card')).toBeVisible();
  });

  test('placing a pin does not select a precinct', async ({ page }) => {
    await page.goto('/map');
    await page.waitForSelector('.leaflet-container', { timeout: 10000 });
    await page.locator('.leaflet-control-share-button').click();

    const map = page.locator('.interactive-map');
    const box = (await map.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    // The share card shows, not the precinct info card.
    await expect(page.locator('.share-card')).toBeVisible();
    await expect(page.locator('.precinct-info-card')).toHaveCount(0);
  });
});
