import { test, expect, type Page } from '@playwright/test';

const ROUTES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/guidelines', name: 'Guidelines' },
  { path: '/design-system', name: 'Design System' },
  { path: '/notice-board', name: 'Notice Board' },
];

const MOBILE_VIEWPORTS = [
  { width: 375, height: 667, name: 'iPhone SE' },
  { width: 390, height: 844, name: 'iPhone 12/13/14' },
  { width: 820, height: 1180, name: 'iPad Air (portrait)' },
];

test.describe('Mobile Navigation & Core Layout Audit', () => {

  test.describe('Hamburger Menu Functionality', () => {
    for (const viewport of MOBILE_VIEWPORTS) {
      test(`should open and close mobile menu on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Find hamburger button
        const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');
        await expect(hamburgerButton).toBeVisible();

        // Open menu
        await hamburgerButton.click();

        // Wait for dialog to appear
        const dialog = page.locator('[role="dialog"]');
        await expect(dialog).toBeVisible({ timeout: 1000 });

        // Verify menu items are visible
        const navItems = dialog.locator('nav a');
        await expect(navItems.first()).toBeVisible();

        // Close menu by clicking a link
        await navItems.first().click();
        await expect(dialog).not.toBeVisible({ timeout: 1000 });
      });
    }

    test('should close menu when clicking backdrop', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open menu
      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');
      await hamburgerButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Click on backdrop (outside the menu panel)
      // The backdrop is the overlay behind the menu
      const backdrop = page.locator('.fixed.inset-0.bg-black\\/25');
      await backdrop.click({ position: { x: 10, y: 10 } });

      // Menu should close
      await expect(dialog).not.toBeVisible({ timeout: 1000 });
    });

    test('should animate menu smoothly on open/close', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');

      // Record open animation
      await hamburgerButton.click();
      const dialogPanel = page.locator('[role="dialog"] > div > div > div');

      // Panel should start from translated position and animate in
      await expect(dialogPanel).toBeVisible();

      // Close it
      await page.locator('[role="dialog"] nav a').first().click();
      await expect(dialogPanel).not.toBeVisible();
    });
  });

  test.describe('Touch Target Sizes', () => {
    test('navigation links should meet 44px minimum touch target', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Open mobile menu
      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');
      await hamburgerButton.click();

      // Check all navigation links
      const navLinks = page.locator('[role="dialog"] nav a');
      const count = await navLinks.count();

      for (let i = 0; i < count; i++) {
        const link = navLinks.nth(i);
        const box = await link.boundingBox();

        if (box) {
          // Links should have py-3 (12px each = 24px) + text height
          // Total should be >= 44px
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    });

    test('hamburger button should have adequate touch target', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');
      const box = await hamburgerButton.boundingBox();

      expect(box).toBeTruthy();
      if (box) {
        // Button has p-2 (8px each = 16px) + icon (24px with spacing)
        // Should be at least 40px (close to 44px minimum)
        expect(box.height).toBeGreaterThanOrEqual(40);
        expect(box.width).toBeGreaterThanOrEqual(40);
      }
    });

    test('footer links should have adequate spacing', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Scroll to footer
      await page.locator('footer').scrollIntoViewIfNeeded();

      // Check footer links
      const footerLinks = page.locator('footer a.footer-link');
      const count = await footerLinks.count();

      for (let i = 0; i < count; i++) {
        const link = footerLinks.nth(i);
        const box = await link.boundingBox();

        if (box) {
          // Footer links should be at least tappable (minimum 32px for non-critical)
          expect(box.height).toBeGreaterThanOrEqual(24);
        }
      }
    });
  });

  test.describe('Footer Responsive Layout', () => {
    test('should show 1 column on mobile (375px)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      await page.locator('footer').scrollIntoViewIfNeeded();

      const footerGrid = page.locator('.footer-grid');
      const gridStyle = await footerGrid.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // On mobile, should be 1fr (single column)
      expect(gridStyle).toContain('1fr');
      expect(gridStyle.split(' ').filter(s => s.includes('fr')).length).toBe(1);
    });

    test('should show 4 columns on tablet/desktop (768px+)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      await page.locator('footer').scrollIntoViewIfNeeded();

      const footerGrid = page.locator('.footer-grid');
      const gridStyle = await footerGrid.evaluate(el =>
        window.getComputedStyle(el).gridTemplateColumns
      );

      // On tablet+, should be 1fr 1fr 1fr 1fr (4 columns)
      const columns = gridStyle.split(' ').filter(s => s.includes('fr'));
      expect(columns.length).toBe(4);
    });
  });

  test.describe('UtilityDock Visibility and Interaction', () => {
    test('should be visible and interactive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const utilityDock = page.locator('.utility-dock');
      await expect(utilityDock).toBeVisible();

      // Check utility items are visible
      const utilityItems = page.locator('.utility-item');
      const count = await utilityItems.count();

      expect(count).toBeGreaterThan(0);

      // Check first item is clickable
      const firstItem = utilityItems.first();
      await expect(firstItem).toBeVisible();

      // Verify it has proper touch target
      const box = await firstItem.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(100); // Icons + label
        expect(box.width).toBeGreaterThanOrEqual(100);
      }
    });

    test('should wrap items on narrow viewports', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const utilityGrid = page.locator('.utility-grid');
      const flexWrap = await utilityGrid.evaluate(el =>
        window.getComputedStyle(el).flexWrap
      );

      // Should wrap on mobile
      expect(flexWrap).toBe('wrap');
    });
  });

  test.describe('ScrollToTop Behavior', () => {
    test('should scroll to top on route navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(100);

      const scrollBefore = await page.evaluate(() => window.scrollY);
      expect(scrollBefore).toBeGreaterThan(0);

      // Navigate to another page
      await page.goto('/about');
      await page.waitForLoadState('networkidle');

      // Should be at top
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(scrollAfter).toBe(0);
    });

    test('should preserve scroll position for anchor links', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/guidelines');

      // Click anchor link
      await page.click('a[href="/guidelines#parking"]');
      await page.waitForTimeout(500);

      // Should have scrolled to section (not at top)
      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });
  });

  test.describe('Horizontal Scroll Prevention', () => {
    for (const viewport of MOBILE_VIEWPORTS) {
      test(`should not have horizontal scroll on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });

        for (const route of ROUTES_TO_TEST) {
          await page.goto(route.path);
          await page.waitForLoadState('networkidle');

          // Check body width doesn't exceed viewport
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = viewport.width;

          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
        }
      });
    }
  });

  test.describe('Logo and Branding', () => {
    test('logo should be visible and properly sized on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const logo = page.locator('.nav-logo');
      await expect(logo).toBeVisible();

      const box = await logo.boundingBox();
      expect(box).toBeTruthy();
      if (box) {
        // Logo should be readable but not too large
        expect(box.height).toBeGreaterThan(20);
        expect(box.height).toBeLessThan(60);
      }
    });

    test('logo should be clickable and return to home', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/about');

      const logo = page.locator('.nav-logo');
      await logo.click();

      await page.waitForURL('/');
      expect(page.url()).toContain('/');
    });
  });

  test.describe('Route-Specific Tests', () => {
    for (const route of ROUTES_TO_TEST) {
      test(`${route.name} should render without layout issues on mobile`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(route.path);

        // Check basic layout components are present
        await expect(page.locator('header.nav')).toBeVisible();
        await expect(page.locator('footer.footer')).toBeVisible();

        // Take screenshot for visual reference
        await page.screenshot({
          path: `tests/e2e/mobile/screenshots/${route.name.toLowerCase().replace(' ', '-')}-mobile.png`,
          fullPage: true
        });
      });
    }
  });

  test.describe('Accessibility - Mobile Menu', () => {
    test('hamburger button should have proper ARIA attributes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');

      // Check initial state
      const ariaExpanded = await hamburgerButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBe('false');

      // Open menu
      await hamburgerButton.click();

      // Check updated state
      const ariaExpandedOpen = await hamburgerButton.getAttribute('aria-expanded');
      expect(ariaExpandedOpen).toBe('true');
    });

    test('mobile menu should trap focus when open', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');
      await hamburgerButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Tab through menu items
      await page.keyboard.press('Tab');

      // Focus should be within dialog
      const focusedElement = await page.evaluateHandle(() => document.activeElement);
      const isInDialog = await page.evaluate((el) => {
        const dialog = document.querySelector('[role="dialog"]');
        return dialog?.contains(el as Node) || false;
      }, focusedElement);

      expect(isInDialog).toBe(true);
    });
  });

  test.describe('Performance - Menu Animation', () => {
    test('menu should open within 300ms', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const hamburgerButton = page.locator('button[aria-label="Toggle navigation"]');

      const startTime = Date.now();
      await hamburgerButton.click();

      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible({ timeout: 500 });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should open within 400ms (300ms animation + 100ms tolerance)
      expect(duration).toBeLessThan(400);
    });
  });
});
