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

  test('homepage head links to v3 favicon SVG (tab icon)', async ({ page, request }) => {
    await page.goto('/');
    // Next may emit both .ico and .svg icons; the first link is not always SVG.
    const svgHref = await page.evaluate(() => {
      const links = [...document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"]')];
      for (const el of links) {
        const type = el.getAttribute('type');
        const href = el.getAttribute('href') ?? '';
        if (type === 'image/svg+xml' || href.includes('.svg')) return href;
      }
      return null;
    });
    expect(svgHref, 'expected a head link to an SVG favicon').toBeTruthy();
    const url = new URL(svgHref!, page.url()).href;
    const res = await request.get(url);
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain('#2C3E2D');
    expect(body).toContain('#E8EDE6');
    expect(body).toContain('Verdana');
    expect(body).not.toContain('#1A2218');
    expect(body).not.toContain('aberration-main');
  });

  test('GET /favicon.svg serves the same v3 asset as the tab icon', async ({ request }) => {
    const res = await request.get('/favicon.svg');
    expect(res.ok()).toBe(true);
    const body = await res.text();
    expect(body).toContain('#E8EDE6');
    expect(body).not.toContain('#1A2218');
  });
});
