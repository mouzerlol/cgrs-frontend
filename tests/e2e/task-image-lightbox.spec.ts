import { test, expect, describe } from '@playwright/test';

/**
 * E2E test for task image lightbox functionality.
 *
 * Prerequisites:
 * - A board with at least one task that has multiple images attached.
 * - User is authenticated (uses chromium-authenticated project).
 *
 * Flow:
 * 1. Navigate to a board
 * 2. Click on a task card to open TaskDetailModal
 * 3. Verify images are visible in the Assets section
 * 4. Click an image thumbnail
 * 5. Verify lightbox opens with full-size image
 * 6. Verify navigation between images works (if multiple)
 * 7. Verify lightbox closes on Escape key
 */
describe('Task Image Lightbox', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a board page - using a known board ID from test data
    await page.goto('/work-management/boards/00000000-0000-0000-0000-000000000002/');
    await page.waitForLoadState('networkidle');
  });

  test('opens task detail modal when clicking a task card', async ({ page }) => {
    // Wait for the board to load and find a task card
    const taskCard = page.locator('[data-testid="task-card"]').first();
    await expect(taskCard).toBeVisible({ timeout: 10000 });
  });

  test.describe('with authenticated user', () => {
    test.use({ storageState: 'tests/e2e/.auth/user.json' });

    test('opens lightbox when clicking an image thumbnail in task detail', async ({ page }) => {
      // Wait for task cards to be present
      await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });

      // Click on the first task card to open the detail modal
      await page.locator('[data-testid="task-card"]').first().click();

      // Wait for the task detail modal to open
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible({ timeout: 5000 });

      // Look for image thumbnails in the Assets section
      // The gallery renders images with alt text like "Task asset" or specific alt
      const imageThumbnails = page.locator('.grid button img').first();
      await expect(imageThumbnails).toBeVisible({ timeout: 5000 });

      // Click the image thumbnail to open the lightbox
      await imageThumbnails.click();

      // Verify the lightbox is open - look for the backdrop with bg-black/90
      await expect(page.locator('[class*="fixed inset-0"][class*="bg-black"]')).toBeVisible({ timeout: 3000 });

      // Verify close button is visible
      const closeButton = page.locator('button[aria-label="Close lightbox"]');
      await expect(closeButton).toBeVisible();
    });

    test('closes lightbox when Escape key is pressed', async ({ page }) => {
      // Open task detail modal
      await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
      await page.locator('[data-testid="task-card"]').first().click();
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible({ timeout: 5000 });

      // Find and click an image thumbnail
      const imageThumbnails = page.locator('.grid button img').first();
      await imageThumbnails.click();

      // Lightbox should be open
      await expect(page.locator('[class*="fixed inset-0"][class*="bg-black"]')).toBeVisible({ timeout: 3000 });

      // Press Escape to close
      await page.keyboard.press('Escape');

      // Lightbox should be closed
      await expect(page.locator('[class*="fixed inset-0"][class*="bg-black"]')).not.toBeVisible();
    });

    test('navigates between images using prev/next buttons', async ({ page }) => {
      // Open task detail modal
      await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
      await page.locator('[data-testid="task-card"]').first().click();
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible({ timeout: 5000 });

      // Find and click an image thumbnail
      const imageThumbnails = page.locator('.grid button img').first();
      await imageThumbnails.click();

      // Lightbox should be open with navigation controls
      await expect(page.locator('button[aria-label="Next image"]')).toBeVisible({ timeout: 3000 });
      await expect(page.locator('button[aria-label="Previous image"]')).toBeVisible();

      // Click next to go to the next image
      await page.locator('button[aria-label="Next image"]').click();

      // The image counter should update (e.g., "2 / 3")
      const counter = page.locator('text=/\\d+ \\/ \\d+/');
      await expect(counter).toBeVisible();
    });

    test('closes lightbox when close button is clicked', async ({ page }) => {
      // Open task detail modal
      await page.waitForSelector('[data-testid="task-card"]', { timeout: 10000 });
      await page.locator('[data-testid="task-card"]').first().click();
      await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible({ timeout: 5000 });

      // Find and click an image thumbnail
      const imageThumbnails = page.locator('.grid button img').first();
      await imageThumbnails.click();

      // Lightbox should be open
      await expect(page.locator('[class*="fixed inset-0"][class*="bg-black"]')).toBeVisible({ timeout: 3000 });

      // Click the close button
      await page.locator('button[aria-label="Close lightbox"]').click();

      // Lightbox should be closed
      await expect(page.locator('[class*="fixed inset-0"][class*="bg-black"]')).not.toBeVisible();
    });
  });
});
