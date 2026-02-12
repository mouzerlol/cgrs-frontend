import { test, expect } from '@playwright/test';

test.describe('Internal Links', () => {
  test('homepage has no link to /projects/ (removed broken link)', async ({ page }) => {
    await page.goto('/');
    const projectsLink = await page.$('a[href*="/projects"]');
    expect(projectsLink).toBeNull();
  });

  test('all homepage internal links resolve to non-404 pages', async ({ page, request }) => {
    await page.goto('/');
    const links = await page.$$eval('a[href^="/"]', (anchors) =>
      [...new Set(anchors.map((a) => a.getAttribute('href')!))].filter(
        (href) => !href.startsWith('/#') && !href.startsWith('/guidelines/#')
      )
    );

    const broken: string[] = [];
    for (const href of links) {
      const res = await request.get(href);
      if (res.status() === 404) broken.push(href);
    }
    expect(broken).toEqual([]);
  });
});

test.describe('SEO Metadata', () => {
  test('homepage has title in head', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBe('CGRS - Coronation Gardens Residents Society');
  });

  test('homepage has meta description', async ({ page }) => {
    await page.goto('/');
    const description = await page.$eval(
      'meta[name="description"]',
      (el) => el.getAttribute('content')
    );
    expect(description).toContain('Coronation Gardens');
    expect(description!.length).toBeGreaterThanOrEqual(50);
  });

  test('homepage has OpenGraph tags', async ({ page }) => {
    await page.goto('/');
    const ogTitle = await page.$eval(
      'meta[property="og:title"]',
      (el) => el.getAttribute('content')
    );
    const ogDesc = await page.$eval(
      'meta[property="og:description"]',
      (el) => el.getAttribute('content')
    );
    const ogType = await page.$eval(
      'meta[property="og:type"]',
      (el) => el.getAttribute('content')
    );
    expect(ogTitle).toBeTruthy();
    expect(ogDesc).toBeTruthy();
    expect(ogType).toBe('website');
  });

  test('no Font Awesome CDN is loaded', async ({ page }) => {
    await page.goto('/');
    const faLink = await page.$('link[href*="font-awesome"]');
    expect(faLink).toBeNull();
  });

  test('does not have duplicate meta descriptions in body', async ({ page }) => {
    await page.goto('/');
    const metaDescriptions = await page.$$('meta[name="description"]');
    expect(metaDescriptions.length).toBe(1);
  });
});
