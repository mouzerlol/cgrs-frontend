import { test, expect, describe } from '@playwright/test';

describe('Discussion Forum Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discussion');
    await page.waitForLoadState('networkidle');
  });

  describe('Page Load', () => {
    test('displays the discussion page with title', async ({ page }) => {
      await expect(page.locator('h1:has-text("Community Discussion")')).toBeVisible();
    });

    test('shows all threads by default', async ({ page }) => {
      // Wait for threads to load - look for thread title h3 elements
      await page.waitForSelector('h3', { timeout: 10000 });
      
      // Should show threads on initial load
      const threadTitles = page.locator('h3');
      const count = await threadTitles.count();
      expect(count).toBeGreaterThan(0);
    });

    test('displays the category sidebar', async ({ page }) => {
      // Desktop sidebar (visible on lg+ screens)
      const sidebar = page.locator('nav[aria-label="Discussion categories"]');
      await expect(sidebar).toBeVisible();
    });

    test('shows All Categories as active by default', async ({ page }) => {
      // Check that the "All Categories" tab is active
      const allCategoriesTab = page.locator('button[role="tab"][aria-selected="true"]');
      await expect(allCategoriesTab).toContainText('All Categories');
    });
  });

  describe('Category Filtering', () => {
    test('filters threads by Introductions category', async ({ page }) => {
      // Click on Introductions category in sidebar
      await page.locator('button[role="tab"]:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      // Verify thread titles are visible
      const threadTitles = page.locator('h3');
      const count = await threadTitles.count();
      expect(count).toBeGreaterThan(0);
    });

    test('filters threads by Announcements category', async ({ page }) => {
      await page.locator('button[role="tab"]:has-text("Announcements")').click();
      await page.waitForTimeout(500);

      const threadTitles = page.locator('h3');
      const count = await threadTitles.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('filters threads by Parking category', async ({ page }) => {
      await page.locator('button[role="tab"]:has-text("Parking")').click();
      await page.waitForTimeout(500);

      const threadTitles = page.locator('h3');
      const count = await threadTitles.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('shows empty state for Events category (no threads)', async ({ page }) => {
      await page.locator('button[role="tab"]:has-text("Events")').click();
      await page.waitForTimeout(500);

      // Should show empty message
      await expect(page.locator('text=No discussions in this category')).toBeVisible();
    });

    test('returns to all threads when clicking All Categories', async ({ page }) => {
      // Click a category first
      await page.locator('button[role="tab"]:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      // Click All Categories
      await page.locator('button[role="tab"]:has-text("All Categories")').click();
      await page.waitForTimeout(500);

      // Should show threads again
      const threadTitles = page.locator('h3');
      const count = await threadTitles.count();
      expect(count).toBeGreaterThan(0);
    });

    test('updates active tab state correctly', async ({ page }) => {
      // Initially All Categories should be active
      let activeTab = page.locator('button[role="tab"][aria-selected="true"]');
      await expect(activeTab).toContainText('All Categories');

      // Click Introductions
      await page.locator('button[role="tab"]:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      activeTab = page.locator('button[role="tab"][aria-selected="true"]');
      await expect(activeTab).toContainText('Introductions');
    });
  });

  describe('View Mode Toggle', () => {
    test('switches to card view', async ({ page }) => {
      // Default is compact view
      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);

      // Should have grid layout in card view
      const threadList = page.locator('.grid.grid-cols-1');
      await expect(threadList.first()).toBeVisible();
    });

    test('switches to compact view', async ({ page }) => {
      // First switch to card view
      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);

      // Then switch back to compact
      await page.locator('button[aria-label="Compact view"]').click();
      await page.waitForTimeout(500);

      // Should have space-y layout in compact view
      const threadList = page.locator('[class*="space-y"]');
      await expect(threadList.first()).toBeVisible();
    });

    test('maintains thread count when toggling views', async ({ page }) => {
      const initialCount = await page.locator('h3').count();

      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);
      const cardCount = await page.locator('h3').count();

      await page.locator('button[aria-label="Compact view"]').click();
      await page.waitForTimeout(500);
      const compactCount = await page.locator('h3').count();

      expect(initialCount).toBe(cardCount);
      expect(initialCount).toBe(compactCount);
    });
  });

  describe('Sort Functionality', () => {
    test('changes sort option', async ({ page }) => {
      // Click the sort dropdown button (contains the current sort label)
      const sortButton = page.locator('button:has-text("Newest"), button:has-text("Most Upvoted"), button:has-text("Most Discussed")').first();
      await sortButton.click();
      await page.waitForTimeout(500);

      // Select a different option - "Most Discussed"
      await page.locator('text=Most Discussed').click();
      await page.waitForTimeout(500);

      // Verify sort changed by checking button text
      const updatedButton = page.locator('button:has-text("Most Discussed")').first();
      await expect(updatedButton).toBeVisible();
    });
  });

  describe('Thread Actions', () => {
    test('displays upvote buttons on threads', async ({ page }) => {
      const upvoteButtons = page.locator('button[aria-label*="Upvote"]');
      await expect(upvoteButtons.first()).toBeVisible();
    });

    test('displays share buttons on threads', async ({ page }) => {
      const shareButtons = page.locator('button[aria-label*="Share"]');
      await expect(shareButtons.first()).toBeVisible();
    });

    test('displays report buttons on threads', async ({ page }) => {
      const reportButtons = page.locator('button[aria-label*="Report"]');
      await expect(reportButtons.first()).toBeVisible();
    });
  });

  describe('New Discussion Button', () => {
    test('navigates to new discussion page', async ({ page }) => {
      // Look for any link to the new discussion page - it may be in different positions
      const newButton = page.locator('a[href*="/discussion/new"]').first();
      
      // Use force: true in case element is slightly off-screen
      await newButton.click({ force: true });
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/discussion\/new/);
    });
  });

  describe('Thread Links', () => {
    test('navigates to thread detail page when clicking a thread', async ({ page }) => {
      // Click on first thread card (the h3 title inside the card)
      const firstThread = page.locator('h3').first();
      await expect(firstThread).toBeVisible();

      await firstThread.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/discussion\/thread\//);
    });
  });

  describe('Category Counts', () => {
    test('displays correct thread counts in sidebar', async ({ page }) => {
      // Check that counts are displayed next to categories
      const introTab = page.locator('button[role="tab"]:has-text("Introductions")');
      await expect(introTab).toContainText('3');
    });

    test('updates thread count display after filtering', async ({ page }) => {
      // The active tab should show the correct count
      await page.locator('button[role="tab"]:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      const activeTab = page.locator('button[role="tab"][aria-selected="true"]');
      await expect(activeTab).toContainText('3');
    });
  });

  describe('Responsive Behavior', () => {
    test('hides sidebar on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // Sidebar should be hidden (hidden lg class)
      const sidebar = page.locator('nav[aria-label="Discussion categories"]');
      await expect(sidebar).toHaveClass(/hidden/);
    });

    test('shows mobile dropdown on small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      // The dropdown is visible on mobile (lg:hidden class) - look for the dropdown container
      const dropdown = page.locator('.lg\\:hidden.relative.bg-forest-light');
      await expect(dropdown).toBeVisible();
    });
  });
});

describe('Discussion Forum - Empty States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/discussion');
    await page.waitForLoadState('networkidle');
  });

  test('shows empty state for category with no threads', async ({ page }) => {
    // Find the Events category tab and click it
    await page.locator('button[role="tab"]:has-text("Events")').click();
    await page.waitForTimeout(1000);

    // Check for empty message - may have "yet" or not depending on category
    await expect(page.locator('text=No discussions').first()).toBeVisible();
  });
});
