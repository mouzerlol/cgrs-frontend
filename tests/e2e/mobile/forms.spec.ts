import { test, expect } from '@playwright/test';

/**
 * Mobile-first form testing suite for CGRS Frontend
 * Tests form submission flows, validation, touch targets, and accessibility
 *
 * Devices tested:
 * - iPhone SE (375px width) - smallest common mobile viewport
 * - iPhone 12 Pro (390px width) - modern standard
 * - Pixel 5 (393px width) - Android reference
 */

// Common mobile viewports
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
        await page.waitForSelector('#form');
      });

      test('should display contact form with all fields', async ({ page }) => {
        await expect(page.locator('#name')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#subject')).toBeVisible();
        await expect(page.locator('#message')).toBeVisible();
      });

      test('should have inputs with minimum 44px tap target height', async ({ page }) => {
        const inputIds = ['name', 'email', 'subject', 'message'];

        for (const id of inputIds) {
          const input = page.locator(`#${id}`);
          const box = await input.boundingBox();

          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('should validate and show inline errors', async ({ page }) => {
        // Submit empty form
        await page.click('button[type="submit"]');

        // Check for error messages
        await expect(page.locator('text=Name is required')).toBeVisible();
        await expect(page.locator('text=Email is required')).toBeVisible();
      });

      test('should clear errors when user starts typing', async ({ page }) => {
        // Trigger validation
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Name is required')).toBeVisible();

        // Start typing
        await page.fill('#name', 'John Doe');

        // Error should clear
        await expect(page.locator('text=Name is required')).not.toBeVisible();
      });

      test('should have full-width submit button on mobile', async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]');
        const box = await submitButton.boundingBox();
        const viewportWidth = width;

        // Button should span most of the viewport (accounting for container padding)
        expect(box?.width).toBeGreaterThan(viewportWidth * 0.85);
      });

      test('should show success message after submission', async ({ page }) => {
        // Fill form
        await page.fill('#name', 'John Doe');
        await page.fill('#email', 'john@example.com');
        await page.fill('#subject', 'Test Subject');
        await page.fill('#message', 'This is a test message with enough characters');

        // Submit
        await page.click('button[type="submit"]');

        // Wait for success message
        await expect(page.locator('text=Thank You!')).toBeVisible({ timeout: 5000 });
      });

      test('should validate email format', async ({ page }) => {
        await page.fill('#email', 'invalid-email');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
      });

      test('should validate message minimum length', async ({ page }) => {
        await page.fill('#message', 'Short');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Message must be at least 10 characters')).toBeVisible();
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
      });

      test('should display login form', async ({ page }) => {
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
      });

      test('should have minimum 44px tap targets', async ({ page }) => {
        const emailBox = await page.locator('#email').boundingBox();
        const passwordBox = await page.locator('#password').boundingBox();

        expect(emailBox?.height).toBeGreaterThanOrEqual(44);
        expect(passwordBox?.height).toBeGreaterThanOrEqual(44);
      });

      test('should toggle password visibility', async ({ page }) => {
        const passwordInput = page.locator('#password');
        const toggleButton = page.locator('button:has-text("Show")');

        // Initially password type
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle
        await toggleButton.click();

        // Should change to text
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Toggle text should change
        await expect(page.locator('button:has-text("Hide")')).toBeVisible();
      });

      test('should show validation errors', async ({ page }) => {
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Email is required')).toBeVisible();
        await expect(page.locator('text=Password is required')).toBeVisible();
      });

      test('should have full-width submit button', async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]');
        const box = await submitButton.boundingBox();

        expect(box?.width).toBeGreaterThan(width * 0.85);
      });

      test('should navigate to forgot password page', async ({ page }) => {
        await page.click('text=Forgot Password?');
        await expect(page).toHaveURL('/forgot-password');
      });

      test('should navigate to register page', async ({ page }) => {
        await page.click('text=Register Account');
        await expect(page).toHaveURL('/register');
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
      });

      test('should display registration form', async ({ page }) => {
        await expect(page.locator('#firstName')).toBeVisible();
        await expect(page.locator('#lastName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('#confirmPassword')).toBeVisible();
        await expect(page.locator('#agreeToTerms')).toBeVisible();
      });

      test('should have minimum 44px tap targets for text inputs', async ({ page }) => {
        const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];

        for (const field of fields) {
          const box = await page.locator(`#${field}`).boundingBox();
          expect(box?.height).toBeGreaterThanOrEqual(44);
        }
      });

      test('should validate password match', async ({ page }) => {
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password456');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Passwords do not match')).toBeVisible();
      });

      test('should require terms acceptance', async ({ page }) => {
        await page.fill('#firstName', 'John');
        await page.fill('#lastName', 'Doe');
        await page.fill('#email', 'john@example.com');
        await page.fill('#password', 'password123');
        await page.fill('#confirmPassword', 'password123');

        // Don't check terms
        await page.click('button[type="submit"]');

        await expect(page.locator('text=You must agree to the terms')).toBeVisible();
      });

      test('should toggle password visibility for both fields', async ({ page }) => {
        const toggleButton = page.locator('button:has-text("Show")').first();

        await toggleButton.click();

        await expect(page.locator('#password')).toHaveAttribute('type', 'text');
        await expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'text');
      });

      test('checkbox should be tappable', async ({ page }) => {
        const checkbox = page.locator('#agreeToTerms');

        // Check the checkbox
        await checkbox.click();
        await expect(checkbox).toBeChecked();

        // Uncheck
        await checkbox.click();
        await expect(checkbox).not.toBeChecked();
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
      });

      test('should display forgot password form', async ({ page }) => {
        await expect(page.locator('#email')).toBeVisible();
      });

      test('should validate email', async ({ page }) => {
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Email is required')).toBeVisible();

        await page.fill('#email', 'invalid-email');
        await page.click('button[type="submit"]');
        await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
      });

      test('should show success message after submission', async ({ page }) => {
        await page.fill('#email', 'test@example.com');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Reset Link Sent')).toBeVisible({ timeout: 5000 });
      });

      test('should have full-width submit button', async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]');
        const box = await submitButton.boundingBox();

        expect(box?.width).toBeGreaterThan(width * 0.85);
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
      });

      test('should display category dropdown on mobile', async ({ page }) => {
        const dropdown = page.locator('.category-dropdown');
        await expect(dropdown).toBeVisible();
      });

      test('should hide category tabs on mobile', async ({ page }) => {
        const tabs = page.locator('.category-tabs');
        await expect(tabs).not.toBeVisible();
      });

      test('should open category dropdown and select category', async ({ page }) => {
        // Click dropdown trigger
        await page.click('.category-dropdown-trigger');

        // Wait for menu to appear
        await expect(page.locator('.category-dropdown-menu')).toBeVisible();

        // Select a category
        await page.click('.category-dropdown-option:has-text("Waste Management")');

        // Verify category changed
        await expect(page.locator('.category-dropdown-selected:has-text("Waste Management")')).toBeVisible();
      });

      test('should display all required form fields', async ({ page }) => {
        await expect(page.locator('#fullName')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#subject')).toBeVisible();
        await expect(page.locator('#description')).toBeVisible();
      });

      test('should have minimum 44px tap targets', async ({ page }) => {
        const fields = ['fullName', 'email', 'subject', 'description'];

        for (const field of fields) {
          const box = await page.locator(`#${field}`).boundingBox();

          if (field === 'description') {
            // Textarea might be taller
            expect(box?.height).toBeGreaterThanOrEqual(100);
          } else {
            expect(box?.height).toBeGreaterThanOrEqual(44);
          }
        }
      });

      test('should validate required fields', async ({ page }) => {
        await page.click('button[type="submit"]');

        // Should show validation errors
        await expect(page.locator('text=Full name is required').or(page.locator('.request-form-error')).first()).toBeVisible();
      });

      test('should scroll to first error on validation failure', async ({ page }) => {
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Submit form
        await page.click('button[type="submit"]');

        // Wait a moment for scroll animation
        await page.waitForTimeout(500);

        // First field (fullName) should be in viewport
        const firstField = page.locator('#fullName');
        await expect(firstField).toBeInViewport();
      });

      test('should show character counter for description', async ({ page }) => {
        const counter = page.locator('.request-form-counter');
        await expect(counter).toBeVisible();
        await expect(counter).toContainText('/ 2000');

        // Type some text
        await page.fill('#description', 'Test description');

        // Counter should update
        await expect(counter).toContainText('16 / 2000');
      });

      test('should have full-width submit button on mobile', async ({ page }) => {
        const submitButton = page.locator('button[type="submit"]');
        const box = await submitButton.boundingBox();

        // Should be close to full width
        expect(box?.width).toBeGreaterThan(width * 0.85);
      });

      test('should show success confirmation after submission', async ({ page }) => {
        // Fill required fields
        await page.fill('#fullName', 'John Doe');
        await page.fill('#email', 'john@example.com');
        await page.fill('#subject', 'Test Request');
        await page.fill('#description', 'This is a detailed description with more than twenty characters');

        // Submit
        await page.click('button[type="submit"]');

        // Wait for success message
        await expect(page.locator('text=Request Received')).toBeVisible({ timeout: 5000 });
      });

      test('category dropdown trigger should have minimum 44px height', async ({ page }) => {
        const trigger = page.locator('.category-dropdown-trigger');
        const box = await trigger.boundingBox();

        expect(box?.height).toBeGreaterThanOrEqual(44);
      });
    });
  });
});

test.describe('Mobile Forms - Focus Management', () => {
  test('should show focus indicators for keyboard navigation', async ({ page }) => {
    await page.goto('/contact');

    // Tab to first input
    await page.keyboard.press('Tab');

    // Name field should have focus
    const nameField = page.locator('#name');
    await expect(nameField).toBeFocused();

    // Should have visible focus indicator (ring or outline)
    const styles = await nameField.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        boxShadow: computed.boxShadow,
      };
    });

    // Should have either outline or box-shadow for focus
    const hasFocusIndicator = styles.outline !== 'none' || styles.boxShadow !== 'none';
    expect(hasFocusIndicator).toBe(true);
  });
});

test.describe('Mobile Forms - Error Message Visibility', () => {
  test('should wrap error messages on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 }); // Very small screen
    await page.goto('/contact');

    // Trigger validation
    await page.fill('#email', 'this-is-a-very-long-invalid-email-address-that-should-trigger-validation-error');
    await page.click('button[type="submit"]');

    // Error message should be visible and not overflow
    const errorMessage = page.locator('text=Please enter a valid email address');
    await expect(errorMessage).toBeVisible();

    const box = await errorMessage.boundingBox();
    expect(box?.width).toBeLessThan(320); // Should not overflow viewport
  });
});

test.describe('Mobile Forms - Image Upload', () => {
  test('should allow file selection on mobile', async ({ page }) => {
    await page.goto('/management-request');

    // Look for file input (hidden but functional)
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();

    // Verify accept attribute for images
    await expect(fileInput).toHaveAttribute('accept', 'image/*');

    // Verify multiple files allowed
    await expect(fileInput).toHaveAttribute('multiple');
  });

  test('entire dropzone should be tappable', async ({ page }) => {
    await page.goto('/management-request');

    const dropzone = page.locator('.image-uploader-dropzone');
    await expect(dropzone).toBeVisible();

    // Dropzone should have adequate height for tapping
    const box = await dropzone.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(80);
  });
});
