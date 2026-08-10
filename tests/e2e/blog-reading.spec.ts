import { test, expect, type Page } from '@playwright/test';

/**
 * The public reading path, end to end, against whatever the configured content
 * origin is actually publishing.
 *
 * It used to run against a checked-in fixture origin, and every assertion named
 * a fixture: a post called "Every block type", a figure exactly 1600x900, a
 * callout reading "Submissions close 30 September". That origin is gone — it
 * shipped invented posts inside the production bundle — so this suite no longer
 * knows what it is going to find. It discovers a post from the listing and
 * asserts the things that are true of *any* published article: the layout, the
 * structure of the page, the 404, and the promise that none of it needs the API.
 *
 * The consequence is that content-shaped coverage moved elsewhere and should
 * stay there. Every block type still renders is asserted by the renderer's own
 * tests over an inline corpus; that the writer produces those blocks from
 * markdown is asserted by the API's golden corpus in
 * `cgrs-api/tests/fixtures/blog/markdown`. Neither needs a browser.
 *
 * Requires `BLOG_CONTENT_ORIGIN` to point at an origin with at least one
 * published post — locally that is the MinIO dev bucket. With nothing published
 * the suite skips rather than fails: an empty bucket is a legitimate state of
 * the system, not a broken reading path.
 */

/** The first article the listing offers, or null when nothing is published. */
async function firstPostHref(page: Page): Promise<string | null> {
  await page.goto('/blog');
  await expect(page.getByRole('heading', { name: 'Committee Blog' })).toBeVisible();

  const link = page.locator('a[href^="/blog/"]').first();
  if ((await link.count()) === 0) return null;
  return link.getAttribute('href');
}

test.describe('the blog listing', () => {
  test('names itself and lists what is published', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');

    await expect(page.locator(`a[href="${href}"]`).first()).toBeVisible();
  });

  test('offers a category filter that narrows the grid and gives it back', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');

    const all = page.getByRole('button', { name: 'All posts' });
    if ((await all.count()) === 0) test.skip(true, 'only one category is published');

    const cards = page.locator('a[href^="/blog/"]');
    const total = await cards.count();

    // The first chip that is not "All posts" — whichever category that is.
    const chip = page.locator('button', { hasNotText: 'All posts' }).first();
    await chip.click();
    expect(await cards.count()).toBeLessThanOrEqual(total);

    await all.click();
    expect(await cards.count()).toBe(total);
  });
});

test.describe('an article', () => {
  test('sets the title as the page’s only h1', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.goto(href!);

    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('never scrolls the page horizontally, whatever the body carries', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(href!);

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test('shows the metadata as a structured rail on a wide viewport', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(href!);

    const rail = page.getByRole('complementary', { name: 'About this post' });
    await expect(rail.getByText('Published', { exact: true })).toBeVisible();
    // Reading time is not repeated here — the hero card carries it.
    await expect(rail.getByText('Reading time', { exact: true })).toHaveCount(0);
  });

  test('carries the reading time in the hero card, before the reader starts', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(href!);

    // Scoped to the article's own header — the site's nav bar is a `header` too.
    await expect(page.locator('article header').getByText(/\d+ min read/)).toBeVisible();
  });

  test('leads the hero card with the category as an eyebrow tag', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 1600, height: 900 });
    await page.goto(href!);

    const eyebrow = page.getByTestId('article-category');

    await expect(eyebrow).toBeVisible();
    await expect(eyebrow.locator('svg')).toBeVisible();
  });

  test('drops the rail to a single line on a narrow viewport', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(href!);

    await expect(page.getByRole('complementary', { name: 'About this post' })).toBeHidden();
  });

  test('opens an in-article image in the lightbox', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(href!);

    const expand = page.locator('figure button[aria-label^="View image full size"]').first();
    if ((await expand.count()) === 0) test.skip(true, 'this post carries no in-article figure');

    await expand.scrollIntoViewIfNeeded();
    await expand.click();

    const close = page.getByRole('button', { name: 'Close image viewer' });
    await expect(close).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(close).toBeHidden();
  });

  /*
   * The overlay used to size its stage from the viewport alone and then stack
   * the close chip and the caption ledge on top of that, so on a short window
   * the panel stood taller than the screen and the scroller behind it grew a
   * scrollbar of its own — a second track beside the gutter the document keeps
   * reserved, taking 15px out of the overlay and moving the picture as it
   * arrived. The stage now subtracts its own furniture, so there is nothing to
   * scroll at any height.
   */
  test('opens the lightbox without a scrollbar of its own, however short the window', async ({
    page,
  }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');

    for (const height of [900, 600, 480, 400]) {
      await page.setViewportSize({ width: 1280, height });
      await page.goto(href!);

      const open = page
        .locator('button[aria-label^="View the hero photograph full size"]')
        .first();
      if ((await open.count()) === 0) test.skip(true, 'this post carries no hero photograph');
      await open.click();

      const close = page.getByRole('button', { name: 'Close image viewer' });
      await expect(close).toBeVisible();

      const scroller = page.locator('div.fixed.inset-0.overflow-y-auto').first();
      const overflow = await scroller.evaluate(
        (el) => el.scrollHeight - el.clientHeight
      );
      expect(overflow, `overlay scrolls at ${height}px tall`).toBeLessThanOrEqual(1);

      await page.keyboard.press('Escape');
      await expect(close).toBeHidden();
    }
  });

  test('never relates a post to itself', async ({ page }) => {
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');
    await page.goto(href!);

    const tail = page.locator('section', { hasText: 'Read next' });
    if ((await tail.count()) === 0) test.skip(true, 'only one post is published');

    await expect(tail.locator(`a[href="${href}"]`)).toHaveCount(0);
  });
});

test.describe('unknown slugs', () => {
  test('returns the 404 page for a slug the manifest does not carry', async ({ page }) => {
    const response = await page.goto('/blog/not-a-real-post');
    expect(response?.status()).toBe(404);
  });

  test('does not redirect the removed placeholder posts', async ({ page }) => {
    const response = await page.goto('/blog/welcome-to-coronation-gardens');

    expect(response?.status()).toBe(404);
    // A 404, not a redirect to the listing. Those URLs are simply gone.
    expect(page.url()).toContain('/blog/welcome-to-coronation-gardens');
  });
});

test.describe('the reading path touches nothing but the content origin', () => {
  /*
   * The site's own chrome — the nav bar and feature flags — calls the API on
   * every page of the site, and always did. That is outside this change: what it
   * promised is that *blog content* needs neither the API nor the database, so
   * that is what is asserted. A blog-scoped call here would mean the split paths
   * had been undone.
   */
  test('fetches no blog content from the API', async ({ page }) => {
    const blogCalls: string[] = [];
    page.on('request', (request) => {
      if (/\/api\/v1\/blog/.test(request.url())) blogCalls.push(request.url());
    });

    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');

    await page.goto(href!);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    expect(blogCalls).toEqual([]);
  });

  test('renders the article even with every API call blocked', async ({ page }) => {
    // The strongest form of the promise: with the API unreachable, the article
    // still renders. A cold Cloud Run or a sleeping database cannot reach it.
    const href = await firstPostHref(page);
    test.skip(href === null, 'no published posts at the configured content origin');

    await page.route('**/api/v1/**', (route) => route.abort());
    await page.goto(href!);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
