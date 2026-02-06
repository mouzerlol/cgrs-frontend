import { test, expect } from '@playwright/test';

/**
 * Mobile E2E tests for Interactive Map (/map route)
 *
 * Tests cover:
 * - Map rendering on mobile viewports
 * - POI marker visibility and interaction
 * - Zoom controls functionality
 * - Touch interactions (pan, pinch-zoom)
 * - POI sidebar responsive behavior
 * - Home control button
 * - Scale control visibility
 */

test.describe('Interactive Map - Mobile', () => {
  // Use mobile viewport dimensions
  test.use({
    viewport: { width: 375, height: 667 }, // iPhone SE dimensions
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/map');
    // Wait for map to initialize
    await page.waitForSelector('.interactive-map.loaded', { timeout: 10000 });
  });

  test('map loads without SSR errors', async ({ page }) => {
    // Check that map container is present
    const mapContainer = page.locator('.map-container');
    await expect(mapContainer).toBeVisible();

    // Check that Leaflet map initialized
    const leafletContainer = page.locator('.leaflet-container');
    await expect(leafletContainer).toBeVisible();

    // Verify no console errors related to window/document
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to catch any delayed errors
    await page.waitForTimeout(2000);

    // Check for window/document related errors
    const ssrErrors = errors.filter(err =>
      err.includes('window is not defined') ||
      err.includes('document is not defined')
    );
    expect(ssrErrors).toHaveLength(0);
  });

  test('POI markers are visible and have correct size', async ({ page }) => {
    // Wait for markers to render
    await page.waitForSelector('.custom-marker', { timeout: 5000 });

    // Get all markers
    const markers = page.locator('.custom-marker');
    const markerCount = await markers.count();

    // Verify we have markers (should match POINTS_OF_INTEREST length)
    expect(markerCount).toBeGreaterThan(0);

    // Check first marker dimensions
    const firstMarker = markers.first();
    const markerBox = await firstMarker.boundingBox();

    expect(markerBox).not.toBeNull();
    if (markerBox) {
      // Check if marker meets minimum touch target size (44px)
      // This test will FAIL with current 24px implementation
      const minSize = 44;
      expect(markerBox.width).toBeGreaterThanOrEqual(minSize);
      expect(markerBox.height).toBeGreaterThanOrEqual(minSize);
    }
  });

  test('marker opens popup on tap', async ({ page }) => {
    // Wait for markers
    await page.waitForSelector('.custom-marker', { timeout: 5000 });

    // Tap first marker
    const firstMarker = page.locator('.custom-marker').first();
    await firstMarker.click();

    // Wait for popup to appear
    await page.waitForSelector('.leaflet-popup', { timeout: 3000 });
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible();

    // Verify popup has content
    const popupContent = page.locator('.poi-popup-content');
    await expect(popupContent).toBeVisible();
  });

  test('zoom controls are visible and functional', async ({ page }) => {
    // Check zoom control container
    const zoomControl = page.locator('.leaflet-control-zoom');
    await expect(zoomControl).toBeVisible();

    // Check zoom in button
    const zoomIn = page.locator('.leaflet-control-zoom-in');
    await expect(zoomIn).toBeVisible();

    // Check zoom out button
    const zoomOut = page.locator('.leaflet-control-zoom-out');
    await expect(zoomOut).toBeVisible();

    // Get initial zoom level
    const initialZoom = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getZoom() : null;
    });

    // Tap zoom in
    await zoomIn.click();
    await page.waitForTimeout(500);

    // Verify zoom level increased
    const newZoom = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getZoom() : null;
    });

    expect(newZoom).toBeGreaterThan(initialZoom);
  });

  test('home control button is visible and tappable', async ({ page }) => {
    // Check home button exists
    const homeButton = page.locator('.leaflet-control-home-button');
    await expect(homeButton).toBeVisible();

    // Verify button dimensions meet touch target minimum
    const homeBox = await homeButton.boundingBox();
    expect(homeBox).not.toBeNull();

    if (homeBox) {
      // Home button should be at least 44px (currently 36px - will fail)
      const minSize = 44;
      expect(homeBox.width).toBeGreaterThanOrEqual(minSize);
      expect(homeBox.height).toBeGreaterThanOrEqual(minSize);
    }

    // Test functionality - tap home button
    await homeButton.click();
    await page.waitForTimeout(1500); // Wait for flyTo animation

    // Verify map centered (check that map moved)
    const mapCenter = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getCenter() : null;
    });
    expect(mapCenter).not.toBeNull();
  });

  test('POI sidebar is hidden on mobile viewport', async ({ page }) => {
    // Check for POI sidebar
    const sidebar = page.locator('.poi-sidebar, .map-sidebar');

    // Sidebar should be either hidden or not in viewport
    // Current implementation shows sidebar on mobile - this test documents the issue
    const isVisible = await sidebar.isVisible().catch(() => false);

    // This should be false (hidden) but currently is true
    // Test documents Issue cgrs-mobile-map-002
    expect(isVisible).toBe(false); // This will FAIL - sidebar is visible
  });

  test('map height is appropriate for mobile', async ({ page }) => {
    const mapContainer = page.locator('.map-container');
    const mapBox = await mapContainer.boundingBox();

    expect(mapBox).not.toBeNull();
    if (mapBox) {
      // Map should be at least 70vh on mobile
      const viewportHeight = 667; // iPhone SE height
      const minHeight = viewportHeight * 0.7;

      expect(mapBox.height).toBeGreaterThanOrEqual(minHeight);
    }
  });

  test('scale control is visible', async ({ page }) => {
    const scaleControl = page.locator('.leaflet-control-scale');
    await expect(scaleControl).toBeVisible();

    // Check scale line exists
    const scaleLine = page.locator('.leaflet-control-scale-line');
    await expect(scaleLine).toBeVisible();

    // Verify scale text is readable (has content)
    const scaleText = await scaleLine.textContent();
    expect(scaleText).toBeTruthy();
    expect(scaleText?.length).toBeGreaterThan(0);
  });

  test('single-finger drag pans the map', async ({ page }) => {
    // Get initial map center
    const initialCenter = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getCenter() : null;
    });

    // Perform drag gesture
    const mapContainer = page.locator('.leaflet-container');
    const box = await mapContainer.boundingBox();

    if (box) {
      // Simulate touch drag
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 100);
      await page.mouse.up();

      // Wait for pan to complete
      await page.waitForTimeout(500);

      // Verify map center changed
      const newCenter = await page.evaluate(() => {
        const map = (window as any).__leafletMap;
        return map ? map.getCenter() : null;
      });

      // Centers should be different
      expect(newCenter.lat).not.toEqual(initialCenter.lat);
      expect(newCenter.lng).not.toEqual(initialCenter.lng);
    }
  });

  test('boundary polygon renders correctly', async ({ page }) => {
    // Check for boundary polygon path
    const boundaryPath = page.locator('.leaflet-interactive[stroke="#D95D39"]');

    // Boundary should be visible
    await expect(boundaryPath).toBeVisible();

    // Verify polygon has correct styling
    const strokeWidth = await boundaryPath.getAttribute('stroke-width');
    expect(strokeWidth).toBeTruthy();

    const fillOpacity = await boundaryPath.getAttribute('fill-opacity');
    expect(fillOpacity).toBeTruthy();
  });

  test('legend is visible and readable on mobile', async ({ page }) => {
    const legend = page.locator('.map-legend');
    await expect(legend).toBeVisible();

    // Check legend has title
    const legendTitle = page.locator('.map-legend h4');
    await expect(legendTitle).toBeVisible();

    // Check legend items
    const legendItems = page.locator('.legend-item');
    const itemCount = await legendItems.count();
    expect(itemCount).toBeGreaterThan(0);

    // Verify each item has marker and label
    const firstItem = legendItems.first();
    const marker = firstItem.locator('.legend-marker');
    const label = firstItem.locator('.legend-label');

    await expect(marker).toBeVisible();
    await expect(label).toBeVisible();
  });

  test('map does not interfere with page scroll', async ({ page }) => {
    // Scroll page down
    await page.evaluate(() => window.scrollTo(0, 100));
    await page.waitForTimeout(300);

    // Verify scroll position changed
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);

    // Map should not prevent page scroll when user swipes outside map area
    const pageHeader = page.locator('.page-header, [class*="hero"]');
    if (await pageHeader.isVisible()) {
      await pageHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      const newScrollY = await page.evaluate(() => window.scrollY);
      expect(newScrollY).toBeDefined();
    }
  });
});

test.describe('Interactive Map - Tablet (1024px breakpoint)', () => {
  test.use({
    viewport: { width: 1024, height: 768 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/map');
    await page.waitForSelector('.interactive-map.loaded', { timeout: 10000 });
  });

  test('POI sidebar is visible at 1024px', async ({ page }) => {
    // At 1024px, sidebar should be visible
    const sidebar = page.locator('.poi-sidebar, .map-sidebar');
    await expect(sidebar).toBeVisible();

    // Verify sidebar has content
    const sidebarHeader = page.locator('.sidebar-header');
    await expect(sidebarHeader).toBeVisible();

    // Check POI list
    const poiButtons = page.locator('.poi-button');
    const buttonCount = await poiButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('sidebar POI click navigates map', async ({ page }) => {
    // Wait for sidebar
    await page.waitForSelector('.poi-button', { timeout: 5000 });

    // Get initial map center
    const initialCenter = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getCenter() : null;
    });

    // Click first POI in sidebar
    const firstPOI = page.locator('.poi-button').first();
    await firstPOI.click();

    // Wait for flyTo animation
    await page.waitForTimeout(1500);

    // Verify map center changed
    const newCenter = await page.evaluate(() => {
      const map = (window as any).__leafletMap;
      return map ? map.getCenter() : null;
    });

    expect(newCenter.lat).not.toEqual(initialCenter.lat);
    expect(newCenter.lng).not.toEqual(initialCenter.lng);

    // Verify popup opened
    const popup = page.locator('.leaflet-popup');
    await expect(popup).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Interactive Map - Desktop', () => {
  test.use({
    viewport: { width: 1920, height: 1080 },
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/map');
    await page.waitForSelector('.interactive-map.loaded', { timeout: 10000 });
  });

  test('full layout with sidebar, map, and legend', async ({ page }) => {
    // Verify all components visible
    const sidebar = page.locator('.poi-sidebar, .map-sidebar');
    const mapContainer = page.locator('.map-container');
    const legend = page.locator('.map-legend');

    await expect(sidebar).toBeVisible();
    await expect(mapContainer).toBeVisible();
    await expect(legend).toBeVisible();

    // Verify grid layout (sidebar should be 280px)
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox).not.toBeNull();
    if (sidebarBox) {
      expect(sidebarBox.width).toBeCloseTo(280, 10);
    }
  });
});
