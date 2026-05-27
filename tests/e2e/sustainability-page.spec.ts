import { test, expect } from '@playwright/test';

/**
 * /sustainability must be reachable and fully renderable WITHOUT depending on
 * the cgrs-api. Verifies the requirement that visitors arriving via the
 * cold-start banner (when the API is precisely what is unreachable) can still
 * read the explainer.
 */

test.describe('Sustainability page', () => {
  test('renders fully with the cgrs-api blocked at the network layer', async ({ page }) => {
    // Block every request to anything that looks like the cgrs-api: localhost:8000,
    // Cloud Run *.a.run.app, the production cgrs.co.nz API host if probed, etc.
    await page.route('**/health', (route) => route.abort());
    await page.route('**/api/**', (route) => route.abort());
    await page.route('**/*.run.app/**', (route) => route.abort());

    await page.goto('/sustainability/');

    // Masthead Fraunces headline is rendered once.
    await expect(
      page.getByRole('heading', { level: 1, name: /When we sleep, and why we chose to\./ }),
    ).toBeVisible();

    // "The honest part." section is rendered.
    await expect(page.getByRole('heading', { name: /The honest part\./ })).toBeVisible();

    // Sydney and coal references are present.
    await expect(page.getByText(/Sydney/)).toBeVisible();
    await expect(page.getByText(/coal/)).toBeVisible();

    // Almanac list with the expected entries is rendered.
    await expect(page.getByText(/Mangere Bridge Library/)).toBeVisible();
    await expect(page.getByText(/CGRS, the website/)).toBeVisible();

    // The closing line speaks to the cold-start visitor directly.
    await expect(
      page.getByText(/if you arrived between 11 pm and 6 am/i),
    ).toBeVisible();

    // Back-to-home affordance.
    await expect(page.getByRole('link', { name: /Back to the home page/i })).toBeVisible();
  });

  test('renders without making any successful request to the cgrs-api', async ({ page }) => {
    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('/api/') || url.includes('/health') || url.includes('.run.app')) {
        apiCalls.push(url);
      }
    });

    await page.goto('/sustainability/');
    await page.waitForLoadState('networkidle');

    expect(apiCalls).toEqual([]);
  });
});
