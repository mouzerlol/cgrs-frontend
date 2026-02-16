import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 14' },
  { width: 820, height: 1180, name: 'iPad Air' },
];

/**
 * Opens the mobile hamburger menu and returns the dialog locator.
 */
async function openMobileMenu(page: import('@playwright/test').Page) {
  const hamburger = page.locator('button[aria-label="Toggle navigation"]');
  await hamburger.click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 1000 });
  return dialog;
}

test.describe('Hamburger Menu Redesign', () => {

  test.describe('Touch targets (>= 44px)', () => {
    for (const viewport of MOBILE_VIEWPORTS) {
      test(`all interactive elements >= 44px tall on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto('/');

        const dialog = await openMobileMenu(page);

        // Check every link and button inside the dialog
        const interactives = dialog.locator('a, button');
        const count = await interactives.count();
        expect(count).toBeGreaterThan(0);

        for (let i = 0; i < count; i++) {
          const el = interactives.nth(i);
          const box = await el.boundingBox();
          const text = await el.textContent();

          expect(box, `Element "${text}" has no bounding box`).toBeTruthy();
          if (box) {
            expect(
              box.height,
              `Element "${text}" is ${box.height}px tall, needs >= 44px`
            ).toBeGreaterThanOrEqual(44);
          }
        }
      });
    }
  });

  test('hamburger button itself >= 44x44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const hamburger = page.locator('button[aria-label="Toggle navigation"]');
    const box = await hamburger.boundingBox();

    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test('spacing gap between nav and More section >= 24px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const dialog = await openMobileMenu(page);

    // Last link in main nav
    const mainNavLinks = dialog.locator('nav').first().locator('a');
    const lastMainLink = mainNavLinks.last();
    const lastMainBox = await lastMainLink.boundingBox();

    // "More" heading
    const moreHeading = dialog.locator('h3');
    const moreBox = await moreHeading.boundingBox();

    expect(lastMainBox).toBeTruthy();
    expect(moreBox).toBeTruthy();

    if (lastMainBox && moreBox) {
      const gap = moreBox.y - (lastMainBox.y + lastMainBox.height);
      expect(
        gap,
        `Gap between nav and More heading is ${gap}px, needs >= 24px`
      ).toBeGreaterThanOrEqual(24);
    }
  });

  test('logo bounding box height between 50px and 150px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const dialog = await openMobileMenu(page);

    // The logo is the first link inside the dialog panel
    const logoLink = dialog.locator('a').first();
    const box = await logoLink.boundingBox();

    expect(box).toBeTruthy();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(50);
      expect(box.height).toBeLessThanOrEqual(150);
    }
  });

  test('two hr dividers exist inside dialog', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const dialog = await openMobileMenu(page);
    const dividers = dialog.locator('hr');
    await expect(dividers).toHaveCount(2);
  });

  test('desktop nav unchanged at 1024px — no hamburger, no dialog', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');

    // Hamburger should be hidden on desktop
    const hamburger = page.locator('button[aria-label="Toggle navigation"]');
    await expect(hamburger).not.toBeVisible();

    // Desktop nav should be visible
    const desktopNav = page.locator('nav.desktop-nav, header.nav nav').first();
    await expect(desktopNav).toBeVisible();

    // No dialog should exist in DOM
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toHaveCount(0);
  });

  test('menu fits viewport — login button visible without scrolling on 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const dialog = await openMobileMenu(page);

    // Find the login button
    const loginButton = dialog.locator('button:has-text("Resident Login")');
    await expect(loginButton).toBeVisible();

    const box = await loginButton.boundingBox();
    expect(box).toBeTruthy();

    if (box) {
      // Bottom edge of login button should be within the viewport
      const bottomEdge = box.y + box.height;
      expect(
        bottomEdge,
        `Login button bottom (${bottomEdge}px) exceeds viewport height (667px)`
      ).toBeLessThanOrEqual(667);
    }
  });
});
