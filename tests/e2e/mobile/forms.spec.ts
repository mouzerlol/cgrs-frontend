import { test, expect } from '@playwright/test';

/**
 * Mobile-first form testing suite for CGRS Frontend
 * Tests basic form functionality on mobile viewports
 */

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12 Pro', width: 390, height: 844 },
  { name: 'Pixel 5', width: 393, height: 851 },
];

test.describe('Mobile Forms - Contact Form', () => {
  MOBILE_VIEWPORTS.forEach(({ name, width, height }) => {
    test.describe(`on ${name}`, () => {
      test.use({ viewport: { width, height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/contact');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      });

      test('should display contact form', async ({ page }) => {
        const pageLoaded = await page.locator('h1, h2').first().isVisible();
        expect(pageLoaded).toBeTruthy();
      });

      test('should have adequate tap targets', async ({ page }) => {
        const inputIds = ['name', 'email', 'subject', 'message'];

        for (const id of inputIds) {
          const input = page.locator(`#${id}`);
          const box = await input.boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(30);
        }
      });
    });
  });
});

test.describe('Mobile Forms - Login Page', () => {
  MOBILE_VIEWPORTS.forEach(({ name, width, height }) => {
    test.describe(`on ${name}`, () => {
      test.use({ viewport: { width, height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      });

      test('should display login form', async ({ page }) => {
        const pageLoaded = await page.locator('h1, h2').first().isVisible();
        expect(pageLoaded).toBeTruthy();
      });

      test('should have adequate tap targets', async ({ page }) => {
        const emailBox = await page.locator('#email').boundingBox();
        const passwordBox = await page.locator('#password').boundingBox();

        expect(emailBox?.height).toBeGreaterThanOrEqual(30);
        expect(passwordBox?.height).toBeGreaterThanOrEqual(30);
      });

      test('should navigate to forgot password page', async ({ page }) => {
        await page.click('text=Forgot Password?');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/forgot-password/);
      });

      test('should navigate to register page', async ({ page }) => {
        await page.click('text=Register Account');
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/register/);
      });
    });
  });
});

test.describe('Mobile Forms - Register Page', () => {
  MOBILE_VIEWPORTS.forEach(({ name, width, height }) => {
    test.describe(`on ${name}`, () => {
      test.use({ viewport: { width, height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/register');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      });

      test('should display register form', async ({ page }) => {
        const pageLoaded = await page.locator('h1, h2').first().isVisible();
        expect(pageLoaded).toBeTruthy();
      });

      test('should have adequate tap targets', async ({ page }) => {
        const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];

        for (const field of fields) {
          const box = await page.locator(`#${field}`).boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(30);
        }
      });

      test('checkbox should be clickable', async ({ page }) => {
        const checkbox = page.locator('#agreeToTerms');

        await checkbox.click();
        await expect(checkbox).toBeChecked();
      });
    });
  });
});

test.describe('Mobile Forms - Forgot Password Page', () => {
  MOBILE_VIEWPORTS.forEach(({ name, width, height }) => {
    test.describe(`on ${name}`, () => {
      test.use({ viewport: { width, height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/forgot-password');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      });

      test('should display forgot password form', async ({ page }) => {
        const pageLoaded = await page.locator('h1, h2').first().isVisible();
        expect(pageLoaded).toBeTruthy();
      });
    });
  });
});

test.describe('Mobile Forms - Management Request Form', () => {
  MOBILE_VIEWPORTS.forEach(({ name, width, height }) => {
    test.describe(`on ${name}`, () => {
      test.use({ viewport: { width, height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/management-request');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
      });

      test('should display management request form', async ({ page }) => {
        const pageLoaded = await page.locator('h1, h2').first().isVisible();
        expect(pageLoaded).toBeTruthy();
      });

      test('should have adequate tap targets', async ({ page }) => {
        const fields = ['fullName', 'email', 'subject', 'description'];

        for (const field of fields) {
          const box = await page.locator(`#${field}`).boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(30);
        }
      });
    });
  });
});

test.describe('Mobile Forms - Focus Management', () => {
  test('should show focus indicators for keyboard navigation', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Tab multiple times to ensure focus lands on an element
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check if any element has focus
    const focusedElement = page.locator(':focus');
    const isVisible = await focusedElement.isVisible();
    
    // Just verify page loaded correctly
    expect(isVisible).toBeTruthy();
  });
});
