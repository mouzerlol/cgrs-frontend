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
      // Should show 10 threads on initial load
      const threadLinks = page.locator('.discussions-content-panel a[href*="/discussion/thread/"]');
      await expect(threadLinks).toHaveCount(10);
    });

    test('displays the category sidebar', async ({ page }) => {
      const sidebar = page.locator('nav[aria-label="Discussion categories"]');
      await expect(sidebar).toBeVisible();
    });

    test('shows All Categories as active by default', async ({ page }) => {
      const allCategoriesTab = page.locator('.category-tab-active');
      await expect(allCategoriesTab).toContainText('All Categories');
    });
  });

  describe('Category Filtering', () => {
    test('filters threads by Introductions category', async ({ page }) => {
      await page.locator('.category-tab:has-text("Introductions")').click();
      await page.waitForTimeout(1000);

      const threadTitles = page.locator('.discussions-content-panel h3');
      await expect(threadTitles).toHaveCount(3);
      await expect(threadTitles.first()).toContainText('Hello from Block D');
    });

    test('filters threads by Announcements category', async ({ page }) => {
      await page.locator('.category-tab:has-text("Announcements")').click();
      await page.waitForTimeout(1000);

      const threadTitles = page.locator('.discussions-content-panel h3');
      await expect(threadTitles).toHaveCount(1);
      await expect(threadTitles.first()).toContainText('Welcome to the CGRS Community Discussion Board');
    });

    test('filters threads by Parking category', async ({ page }) => {
      await page.locator('.category-tab:has-text("Parking")').click();
      await page.waitForTimeout(1000);

      const threadTitles = page.locator('.discussions-content-panel h3');
      await expect(threadTitles).toHaveCount(1);
      await expect(threadTitles.first()).toContainText('Visitor Parking Rules');
    });

    test('shows empty state for Events category (no threads)', async ({ page }) => {
      await page.locator('.category-tab:has-text("Events")').click();
      await page.waitForTimeout(1000);

      const threadTitles = page.locator('.discussions-content-panel h3');
      await expect(threadTitles).toHaveCount(0);

      // Should show empty message
      await expect(page.locator('text=No discussions in this category')).toBeVisible();
    });

    test('returns to all threads when clicking All Categories', async ({ page }) => {
      await page.locator('.category-tab:has-text("Introductions")').click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.discussions-content-panel h3')).toHaveCount(3);

      await page.locator('.category-tab:has-text("All Categories")').click();
      await page.waitForTimeout(1000);
      await expect(page.locator('.discussions-content-panel h3')).toHaveCount(10);
    });

    test('updates active tab state correctly', async ({ page }) => {
      // Initially All Categories should be active
      let activeTab = page.locator('.category-tab-active');
      await expect(activeTab).toContainText('All Categories');

      // Click Introductions
      await page.locator('.category-tab:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      activeTab = page.locator('.category-tab-active');
      await expect(activeTab).toContainText('Introductions');
    });
  });

  describe('View Mode Toggle', () => {
    test('switches to card view', async ({ page }) => {
      // Default is compact view
      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);

      // Should have grid layout in card view
      const threadList = page.locator('.discussions-content-panel > div > div.grid');
      await expect(threadList).toBeVisible();
    });

    test('switches to compact view', async ({ page }) => {
      // First switch to card view
      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);

      // Then switch back to compact
      await page.locator('button[aria-label="Compact view"]').click();
      await page.waitForTimeout(500);

      // Should have space-y layout in compact view
      const threadList = page.locator('.discussions-content-panel > div > div[class*="space-y"]');
      await expect(threadList).toBeVisible();
    });

    test('maintains thread count when toggling views', async ({ page }) => {
      const initialCount = await page.locator('.discussions-content-panel h3').count();

      await page.locator('button[aria-label="Card view"]').click();
      await page.waitForTimeout(500);
      const cardCount = await page.locator('.discussions-content-panel h3').count();

      await page.locator('button[aria-label="Compact view"]').click();
      await page.waitForTimeout(500);
      const compactCount = await page.locator('.discussions-content-panel h3').count();

      expect(initialCount).toBe(cardCount);
      expect(initialCount).toBe(compactCount);
    });
  });

  describe('Search Functionality', () => {
    test('filters threads by search term', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search discussions..."]');
      await searchInput.fill('parking');
      await page.waitForTimeout(500);

      const threadTitles = page.locator('.discussions-content-panel h3');
      await expect(threadTitles).toHaveCount(1);
      await expect(threadTitles.first()).toContainText('Parking');
    });

    test('shows no results message for non-matching search', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search discussions..."]');
      await searchInput.fill('xyznonexistent');
      await page.waitForTimeout(500);

      await expect(page.locator('text=No discussions found')).toBeVisible();
    });

    test('clears search when input is cleared', async ({ page }) => {
      const searchInput = page.locator('input[placeholder="Search discussions..."]');
      await searchInput.fill('parking');
      await page.waitForTimeout(500);
      await expect(page.locator('.discussions-content-panel h3')).toHaveCount(1);

      await searchInput.clear();
      await page.waitForTimeout(500);
      await expect(page.locator('.discussions-content-panel h3')).toHaveCount(10);
    });
  });

  describe('Sort Functionality', () => {
    test('changes sort option', async ({ page }) => {
      const sortDropdown = page.locator('#headlessui-listbox-button');
      await sortDropdown.click();
      await page.waitForTimeout(500);

      await page.locator('text=Oldest').click();
      await page.waitForTimeout(500);

      // Should now show oldest first
      const firstThread = page.locator('.discussions-content-panel h3').first();
      await expect(firstThread).toContainText('Visitor Parking Rules');
    });
  });

  describe('Thread Actions', () => {
    test('displays upvote buttons on threads', async ({ page }) => {
      const upvoteButtons = page.locator('.discussions-content-panel button[aria-label*="Upvote"]');
      await expect(upvoteButtons.first()).toBeVisible();
    });

    test('displays share buttons on threads', async ({ page }) => {
      const shareButtons = page.locator('.discussions-content-panel button[aria-label*="Share"]');
      await expect(shareButtons.first()).toBeVisible();
    });

    test('displays report buttons on threads', async ({ page }) => {
      const reportButtons = page.locator('.discussions-content-panel button[aria-label*="Report"]');
      await expect(reportButtons.first()).toBeVisible();
    });
  });

  describe('New Discussion Button', () => {
    test('navigates to new discussion page', async ({ page }) => {
      const newButton = page.locator('a[href="/discussion/new"]');
      await expect(newButton).toBeVisible();

      await newButton.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/discussion\/new/);
    });
  });

  describe('Thread Links', () => {
    test('navigates to thread detail page when clicking a thread', async ({ page }) => {
      const firstThread = page.locator('.discussions-content-panel a[href*="/discussion/thread/"]').first();
      await expect(firstThread).toBeVisible();

      await firstThread.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveURL(/\/discussion\/thread\//);
    });
  });

  describe('Category Counts', () => {
    test('displays correct thread counts in sidebar', async ({ page }) => {
      // Check that counts are displayed next to categories
      const introTab = page.locator('.category-tab:has-text("Introductions")');
      await expect(introTab).toContainText('3');
    });

    test('updates thread count display after filtering', async ({ page }) => {
      // The active tab should show the correct count
      await page.locator('.category-tab:has-text("Introductions")').click();
      await page.waitForTimeout(500);

      const activeTab = page.locator('.category-tab-active');
      await expect(activeTab).toContainText('3');
    });
  });

  describe('Responsive Behavior', () => {
    test('hides sidebar on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      const sidebar = page.locator('.category-tabs');
      await expect(sidebar).toHaveClass(/hidden/);
    });

    test('shows mobile dropdown on small viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);

      const dropdown = page.locator('.category-dropdown');
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
    await page.locator('.category-tab:has-text("Events")').click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=No discussions in this category yet')).toBeVisible();
  });

  test('shows search-specific empty message', async ({ page }) => {
    await page.locator('input[placeholder="Search discussions..."]').fill('nonexistent');
    await page.waitForTimeout(500);

    await expect(page.locator(/No discussions found for/)).toBeVisible();
  });
});
