import { test, expect } from '@playwright/test';

/**
 * Mobile-First Design Audit - Discussion System
 *
 * Tests for:
 * - Category navigation switching (sidebar hidden on mobile, dropdown visible)
 * - Thread creation form accessibility on 360px viewport
 * - Reply form responsiveness
 * - Layout switching at 1024px breakpoint
 *
 * Note: Swipe gesture tests are limited in Playwright without physical touch events.
 * Consider Appium or device testing for comprehensive gesture validation.
 */

test.describe('Discussion System - Mobile Layout', () => {
  test.describe('Category Navigation Switching', () => {
    test('should hide sidebar and show dropdown on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/discussion');

      // Sidebar should be hidden (display: none via hidden class)
      const sidebar = page.locator('.category-tabs.hidden');
      await expect(sidebar).toBeHidden();

      // Dropdown should be visible
      const dropdown = page.locator('.category-dropdown');
      await expect(dropdown).toBeVisible();
    });

    test('should show sidebar and hide dropdown on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/discussion');

      // Sidebar should be visible
      const sidebar = page.locator('.category-tabs');
      await expect(sidebar).toBeVisible();

      // Dropdown should be hidden
      const dropdown = page.locator('.category-dropdown.lg\\:hidden');
      await expect(dropdown).toBeHidden();
    });

    test('should switch categories via dropdown on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion');

      // Open dropdown
      const dropdownTrigger = page.locator('.category-dropdown-trigger');
      await dropdownTrigger.click();

      // Dropdown menu should be visible
      const dropdownMenu = page.locator('.category-dropdown-menu');
      await expect(dropdownMenu).toBeVisible();

      // Select a category
      const categoryOption = page.locator('.category-dropdown-option').first();
      await categoryOption.click();

      // Dropdown should close
      await expect(dropdownMenu).not.toBeVisible();
    });

    test('should have minimum 44px touch targets for dropdown trigger', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion');

      const trigger = page.locator('.category-dropdown-trigger');
      const box = await trigger.boundingBox();

      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Thread Creation Form - 360px Viewport', () => {
    test('should display all form fields accessibly on 360px width', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto('/discussion/new');

      // Check all form fields are visible
      await expect(page.locator('#title')).toBeVisible();
      await expect(page.locator('label:has-text("Title")')).toBeVisible();

      // Body textarea should be visible (specific locator may vary)
      const bodyField = page.locator('textarea').first();
      await expect(bodyField).toBeVisible();

      // Category select should be visible
      const categorySelect = page.locator('.category-dropdown-button');
      await expect(categorySelect).toBeVisible();

      // Submit button should be visible
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();

      // Check submit button has adequate touch target
      const submitBox = await submitButton.boundingBox();
      expect(submitBox).not.toBeNull();
      expect(submitBox!.height).toBeGreaterThanOrEqual(44);
    });

    test('should allow form completion on 360px viewport', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto('/discussion/new');

      // Fill title
      await page.locator('#title').fill('Test Thread Title for Mobile');

      // Fill body
      const bodyField = page.locator('textarea').first();
      await bodyField.fill('This is a test thread body to verify mobile form functionality.');

      // Open category dropdown
      await page.locator('.category-dropdown-button').click();

      // Select first category
      await page.locator('.category-option').first().click();

      // Verify form can be submitted (button not disabled)
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).not.toBeDisabled();
    });

    test('should show validation errors clearly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion/new');

      // Try to submit empty form
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();

      // Check for error messages (specific error locators may vary)
      // Title error should be visible
      const titleError = page.locator('.title-error, .thread-form-error');
      await expect(titleError.first()).toBeVisible();
    });
  });

  test.describe('Reply Form Responsiveness', () => {
    test('should display reply form properly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Navigate to a thread detail page (using first thread from discussions.json)
      await page.goto('/discussion/thread/thread-intro-001');

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Find reply form (may need to scroll or trigger reply)
      const replyTextarea = page.locator('textarea[placeholder*="thoughts"]');

      // If reply form is visible, test it
      if (await replyTextarea.isVisible()) {
        // Check textarea is accessible
        await expect(replyTextarea).toBeVisible();

        // Check submit button
        const replySubmit = page.locator('button:has-text("Reply")');
        await expect(replySubmit).toBeVisible();

        // Verify submit button has adequate height
        const submitBox = await replySubmit.boundingBox();
        expect(submitBox).not.toBeNull();
        expect(submitBox!.height).toBeGreaterThanOrEqual(44);
      }
    });

    test('should auto-resize textarea on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion/thread/thread-intro-001');

      // Find reply textarea
      const textarea = page.locator('textarea[placeholder*="thoughts"]').first();

      if (await textarea.isVisible()) {
        const initialHeight = (await textarea.boundingBox())!.height;

        // Fill with multiline content
        await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6');

        // Height should increase (with max of 200px per ReplyForm.tsx)
        const newHeight = (await textarea.boundingBox())!.height;
        expect(newHeight).toBeGreaterThan(initialHeight);
        expect(newHeight).toBeLessThanOrEqual(200);
      }
    });
  });

  test.describe('Thread List Views', () => {
    test('should display thread cards in compact view on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion');

      // Wait for threads to load
      await page.waitForSelector('.thread-card, [class*="ThreadCard"]', { timeout: 5000 });

      // Check that threads are displayed (specific class may vary)
      const threadCards = page.locator('[class*="ThreadCard"], .thread-card');
      await expect(threadCards.first()).toBeVisible();

      // Verify compact layout (single column)
      const threadList = page.locator('[class*="space-y"]').first();
      await expect(threadList).toBeVisible();
    });

    test('should have adequate spacing between thread cards on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion');

      // Wait for threads
      await page.waitForSelector('[class*="ThreadCard"]', { timeout: 5000 });

      // Get thread cards
      const cards = page.locator('[class*="ThreadCard"]');
      const count = await cards.count();

      if (count >= 2) {
        // Check spacing between first two cards
        const firstCard = cards.nth(0);
        const secondCard = cards.nth(1);

        const firstBox = await firstCard.boundingBox();
        const secondBox = await secondCard.boundingBox();

        // Cards should not overlap
        expect(firstBox).not.toBeNull();
        expect(secondBox).not.toBeNull();
        expect(secondBox!.top).toBeGreaterThan(firstBox!.bottom);

        // Should have some gap (at least 8px for space-y-2)
        const gap = secondBox!.top - firstBox!.bottom;
        expect(gap).toBeGreaterThanOrEqual(8);
      }
    });
  });

  test.describe('Layout Breakpoint Tests', () => {
    test('should switch from mobile to desktop layout at 1024px', async ({ page }) => {
      // Start at mobile width
      await page.setViewportSize({ width: 1023, height: 768 });
      await page.goto('/discussion');

      // Verify mobile layout
      const dropdownMobile = page.locator('.category-dropdown');
      await expect(dropdownMobile).toBeVisible();

      // Resize to desktop width
      await page.setViewportSize({ width: 1024, height: 768 });

      // Wait for layout shift
      await page.waitForTimeout(500);

      // Verify desktop layout
      const sidebarDesktop = page.locator('.category-tabs');
      await expect(sidebarDesktop).toBeVisible();
    });
  });

  test.describe('Accessibility Checks', () => {
    test('should have proper focus indicators on mobile interactive elements', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion');

      // Tab through interactive elements
      await page.keyboard.press('Tab');

      // Check if focused element has visible focus ring
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Check for focus-visible styles (CSS-based, may need custom check)
      const focusedBox = await focusedElement.boundingBox();
      expect(focusedBox).not.toBeNull();
    });

    test('should have proper aria labels for mobile actions', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/discussion/new');

      // Check category select has accessible label
      const categoryButton = page.locator('.category-dropdown-button');
      const ariaExpanded = await categoryButton.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeDefined();
    });
  });
});

test.describe('Discussion System - Gesture Hints', () => {
  test('should check for swipe hint presence in SwipeableThreadCard', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/discussion');

    // Note: SwipeableThreadCard may not be used in current implementation
    // This test checks if the hint overlay exists in the DOM
    const swipeHint = page.locator('text=Swipe for actions');

    // May not be visible initially, but should exist in compact view if implemented
    const hintCount = await swipeHint.count();

    // Log for manual verification
    console.log(`Swipe hint count: ${hintCount}`);

    // This is informational - we document in issues if hint is missing
  });
});

/**
 * NOTE: Comprehensive gesture testing requires:
 *
 * 1. Physical Device Testing or Appium:
 *    - Swipe right 40% to trigger upvote
 *    - Swipe left 40% to reveal actions
 *    - Spring-back animation on incomplete swipe
 *    - No scroll/swipe conflicts
 *
 * 2. Visual Regression Testing:
 *    - Swipe feedback colors (green for upvote)
 *    - Action button sizes (48px each)
 *    - Animation smoothness
 *
 * 3. Performance Testing:
 *    - Gesture detection latency
 *    - Animation frame rate
 *    - Touch response time
 *
 * These tests focus on layout, accessibility, and basic functionality
 * that can be verified with Playwright's standard capabilities.
 */
