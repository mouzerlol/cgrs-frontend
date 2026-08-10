import { test, expect, type Page } from '@playwright/test';

/**
 * The visibility gate, end to end.
 *
 * The properties worth driving a browser for are the ones no unit test can
 * reach: that the URL is the same for everyone, that the rewrite to the dynamic
 * route is invisible, and that a viewer who does not pass gets a 404 that looks
 * exactly like the one an unpublished slug gets — no sign-in prompt, no title,
 * nothing naming what is behind it.
 *
 * Discovery, not fixtures. The suite finds a gated post by reading the members
 * manifest at the configured content origin and skips when there is none, the
 * way `blog-reading.spec.ts` skips on an empty bucket. A bucket with no gated
 * posts is a legitimate state of the system.
 *
 * Requires `BLOG_CONTENT_ORIGIN`. The signed-in halves additionally need the
 * `chromium-authenticated` project's stored session, and they assert what that
 * session's role entitles it to — so the session must belong to a user holding
 * `owner`, `society_manager`, `committee_member`, or `committee_chairperson`.
 */

const ORIGIN = process.env.BLOG_CONTENT_ORIGIN ?? '';

interface ManifestPost {
  slug: string;
  title: string;
  visibility?: string;
}

/** A gated post's slug and title, read straight from the members manifest. */
async function gatedPost(page: Page): Promise<ManifestPost | null> {
  if (!ORIGIN) return null;

  const response = await page.request.get(`${ORIGIN.replace(/\/+$/, '')}/members-index.json`);
  if (!response.ok()) return null;

  const manifest = (await response.json()) as { posts: ManifestPost[] };
  return manifest.posts[0] ?? null;
}

/** A public post's slug, for the comparisons that need one. */
async function publicPost(page: Page): Promise<ManifestPost | null> {
  if (!ORIGIN) return null;

  const response = await page.request.get(`${ORIGIN.replace(/\/+$/, '')}/index.json`);
  if (!response.ok()) return null;

  const manifest = (await response.json()) as { posts: ManifestPost[] };
  return manifest.posts[0] ?? null;
}

test.describe('a visitor who does not pass the gate', () => {
  test('is not shown a gated post in the listing', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    await page.goto('/blog');

    await expect(page.locator(`a[href="/blog/${gated!.slug}"]`)).toHaveCount(0);
    await expect(page.getByTestId('owners-only')).toHaveCount(0);
  });

  test('gets a plain 404 on the gated URL, with no invitation to sign in', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.goto(`/blog/${gated!.slug}`);

    expect(response?.status()).toBe(404);
    // The 404 must not disclose that there is something here to be let into.
    await expect(page.getByText(gated!.title, { exact: false })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /sign in/i })).toHaveCount(0);
  });

  test('gets the same 404 as a slug that never existed', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const onGated = await page.goto(`/blog/${gated!.slug}`);
    const gatedBody = await page.locator('body').innerText();

    const onUnknown = await page.goto('/blog/this-slug-was-never-published-anywhere');
    const unknownBody = await page.locator('body').innerText();

    expect(onGated?.status()).toBe(onUnknown?.status());
    expect(gatedBody).toBe(unknownBody);
  });

  test('cannot pull a share card for a gated post', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.request.get(`/api/og/blog?slug=${gated!.slug}`);

    expect(response.status()).toBe(404);
  });

  test('does not find a gated post in the sitemap', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.request.get('/sitemap.xml');
    const xml = await response.text();

    expect(xml).not.toContain(`/blog/${gated!.slug}/`);
  });

  test('still reads public posts normally', async ({ page }) => {
    const open = await publicPost(page);
    test.skip(open === null, 'nothing published at the configured content origin');

    const response = await page.goto(`/blog/${open!.slug}`);

    expect(response?.status()).toBe(200);
  });
});

test.describe('a member who passes the gate', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test('reads the gated post at the same URL a stranger got a 404 on', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.goto(`/blog/${gated!.slug}`);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: gated!.title })).toBeVisible();
    // The rewrite is internal: what the member can copy out of the address bar
    // has to be the URL everyone else uses, or the link is not shareable at all.
    expect(new URL(page.url()).pathname).toBe(`/blog/${gated!.slug}`);
  });

  test('is told the post is not public, so they know the link will not travel', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    await page.goto(`/blog/${gated!.slug}`);

    await expect(page.getByTestId('owners-only').first()).toBeVisible();
  });

  test('sees the gated post in the listing, marked', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    await page.goto('/blog');

    await expect(page.locator(`a[href="/blog/${gated!.slug}"]`).first()).toBeVisible();
    await expect(page.getByTestId('owners-only').first()).toBeVisible();
  });

  test('is gated by the route itself, not only by the rewrite that reached it', async ({ page }) => {
    /*
     * The internal route is never linked, but it is reachable. If it trusted the
     * middleware to have vetted the request, then a matcher edit — or anyone
     * simply typing the path — would walk straight past the gate. It performs
     * its own role check, so this must behave identically to the canonical URL.
     */
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.goto(`/blog-members/${gated!.slug}`);

    expect(response?.status()).toBe(200);
  });

  test('keeps the gated post out of the sitemap even when signed in', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.request.get('/sitemap.xml');

    expect(await response.text()).not.toContain(`/blog/${gated!.slug}/`);
  });
});

test.describe('the internal route, reached directly by someone who does not pass', () => {
  test('404s rather than rendering', async ({ page }) => {
    const gated = await gatedPost(page);
    test.skip(gated === null, 'nothing gated at the configured content origin');

    const response = await page.goto(`/blog-members/${gated!.slug}`);

    expect(response?.status()).toBe(404);
  });
});
