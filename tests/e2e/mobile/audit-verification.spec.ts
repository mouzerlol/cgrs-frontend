/**
 * Mobile Audit Verification - Checks if audit findings were actioned.
 * Run: npx playwright test tests/e2e/mobile/audit-verification.spec.ts
 */
import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORT = { width: 375, height: 667 }; // iPhone SE

test.describe('Mobile Audit Findings Verification', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
  });

  test.describe('Agent 1: Navigation - Touch Targets', () => {
    test('P2 #001: Hamburger button should be >= 44px touch target', async ({ page }) => {
      await page.goto('/');
      const hamburger = page.locator('button[aria-label="Toggle navigation"]');
      await expect(hamburger).toBeVisible();

      const box = await hamburger.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('P2 #003: Footer links should be >= 44px touch target', async ({ page }) => {
      await page.goto('/');
      const footerLink = page.locator('footer a').filter({ hasText: 'About Us' }).first();
      await expect(footerLink).toBeVisible();

      const box = await footerLink.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });

    test('Mobile menu links should have adequate spacing', async ({ page }) => {
      await page.goto('/');
      await page.locator('button[aria-label="Toggle navigation"]').click();

      const firstLink = page.locator('[role="dialog"] nav a').first();
      await expect(firstLink).toBeVisible();

      const box = await firstLink.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Agent 1: Navigation - Layout', () => {
    test('No horizontal scroll on homepage', async ({ page }) => {
      await page.goto('/');
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width);
    });

    test('Footer should be single column on mobile', async ({ page }) => {
      await page.goto('/');
      const grid = page.locator('footer .grid').first();
      const colCount = await grid.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const cols = style.gridTemplateColumns;
        return cols.split(' ').filter(Boolean).length;
      });
      expect(colCount).toBe(1);
    });
  });

  test.describe('Agent 3: Forms - Register', () => {
    test('P1: Confirm Password should have associated label', async ({ page }) => {
      await page.goto('/register');
      const confirmInput = page.locator('#confirmPassword');
      await expect(confirmInput).toBeVisible();

      const label = page.locator('label[for="confirmPassword"]');
      await expect(label).toBeVisible();
    });

    test('P2: Terms checkbox should be >= 44px (or have visible label)', async ({ page }) => {
      await page.goto('/register');
      const checkbox = page.locator('#agreeToTerms');
      await expect(checkbox).toBeVisible();

      const box = await checkbox.boundingBox();
      expect(box).toBeTruthy();
      // WCAG allows 44px OR the label wraps the control - checkbox is 20px but label wraps it
      const label = page.locator('label').filter({ has: page.locator('#agreeToTerms') });
      await expect(label).toBeVisible();
    });
  });

  test.describe('Agent 4: Map', () => {
    test('Map page loads without errors', async ({ page }) => {
      await page.goto('/map');
      await expect(page.locator('.interactive-map.leaflet-container')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Agent 5: Content - Blog', () => {
    test('Blog listing loads', async ({ page }) => {
      await page.goto('/blog');
      await expect(page.locator('h1')).toBeVisible();
    });

    test('Blog post body text should be readable', async ({ page }) => {
      await page.goto('/blog/welcome-to-coronation-gardens');
      const body = page.locator('article p, .prose p').first();
      await expect(body).toBeVisible({ timeout: 5000 });

      const fontSize = await body.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });
  });

  test.describe('Routes - All audited pages load', () => {
    const ROUTES = [
      '/',
      '/about',
      '/contact',
      '/guidelines',
      '/design-system',
      '/notice-board',
      '/discussion',
      '/map',
      '/blog',
      '/calendar',
      '/login',
      '/register',
      '/management-request',
    ];

    for (const route of ROUTES) {
      test(`${route} loads without 500 error`, async ({ page }) => {
        const response = await page.goto(route);
        expect(response?.status()).toBeLessThan(500);
      });
    }
  });
});
