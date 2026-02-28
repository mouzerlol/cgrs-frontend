import { describe, it, expect, vi, beforeAll } from 'vitest';
import type { Metadata } from 'next';

// Mock next/font/google
vi.mock('next/font/google', () => ({
  Fraunces: vi.fn(() => ({
    variable: '--font-fraunces',
    className: 'mock-fraunces',
  })),
  Manrope: vi.fn(() => ({
    variable: '--font-manrope',
    className: 'mock-manrope',
  })),
}));

// Mock all heavy component imports so page modules resolve cleanly
vi.mock('@/components/sections/Hero', () => ({ default: () => null }));
vi.mock('@/components/sections/UtilityDock', () => ({ default: () => null }));
vi.mock('@/components/sections/About', () => ({ default: () => null }));
vi.mock('@/components/sections/EventsSection', () => ({ default: () => null }));
vi.mock('@/components/sections/NewsGrid', () => ({ default: () => null }));
vi.mock('@/components/sections/QuickAccessGrid', () => ({ default: () => null }));
vi.mock('@/components/sections/PageHeader', () => ({ default: () => null }));
vi.mock('@/components/blog/ArticleContent', () => ({ default: () => null }));
vi.mock('@/components/event/EventContent', () => ({ default: () => null }));
vi.mock('@/components/management-request/ManagementRequestForm', () => ({
  ManagementRequestForm: () => null,
}));

interface PageMeta {
  route: string;
  title: string;
  description: string;
}

function extractTitle(meta: unknown): string {
  const metadata = meta as Metadata;
  if (!metadata) return '';
  if (typeof metadata.title === 'string') return metadata.title;
  if (metadata.title && typeof metadata.title === 'object' && 'default' in metadata.title) {
    return metadata.title.default as string;
  }
  return '';
}

describe('Page Metadata - SEO Requirements', () => {
  let pages: PageMeta[];

  beforeAll(async () => {
    pages = [];

    // Server component pages (export metadata from page.tsx)
    const homePage = await import('../(main)/page');
    if (homePage.metadata) {
      pages.push({
        route: '/',
        title: extractTitle(homePage.metadata),
        description: (homePage.metadata as Metadata).description as string,
      });
    }

    const guidelinesPage = await import('../(main)/guidelines/page');
    if (guidelinesPage.metadata) {
      pages.push({
        route: '/guidelines',
        title: extractTitle(guidelinesPage.metadata),
        description: (guidelinesPage.metadata as Metadata).description as string,
      });
    }

    const managementPage = await import('../(main)/management-request/page');
    if (managementPage.metadata) {
      pages.push({
        route: '/management-request',
        title: extractTitle(managementPage.metadata),
        description: (managementPage.metadata as Metadata).description as string,
      });
    }

    // Route layouts (for client component pages)
    const layoutModules: Array<{ route: string; path: () => Promise<{ metadata?: Metadata }> }> = [
      { route: '/about', path: () => import('../(main)/about/layout') },
      { route: '/blog', path: () => import('../(main)/blog/layout') },
      { route: '/calendar', path: () => import('../(main)/calendar/layout') },
      { route: '/contact', path: () => import('../(main)/contact/layout') },
      { route: '/discussion', path: () => import('../(main)/discussion/layout') },
      { route: '/discussion/new', path: () => import('../(main)/discussion/new/layout') },
      { route: '/discussion/thread/[id]', path: () => import('../(main)/discussion/thread/[id]/layout') },
      { route: '/login', path: () => import('../(main)/login/layout') },
      { route: '/register', path: () => import('../(main)/register/layout') },
      { route: '/forgot-password', path: () => import('../(main)/forgot-password/layout') },
      { route: '/map', path: () => import('../(main)/map/layout') },
      { route: '/notice-board', path: () => import('../(main)/notice-board/layout') },
      { route: '/design-system', path: () => import('../(main)/design-system/layout') },
    ];

    for (const { route, path } of layoutModules) {
      const mod = await path();
      if (mod.metadata) {
        pages.push({
          route,
          title: extractTitle(mod.metadata),
          description: (mod.metadata as Metadata).description as string,
        });
      }
    }
  });

  it('has metadata for at least 16 pages', () => {
    expect(pages.length).toBeGreaterThanOrEqual(16);
  });

  it('every page has a title', () => {
    for (const page of pages) {
      expect(page.title, `${page.route} should have a title`).toBeTruthy();
    }
  });

  it('every title is 60 characters or fewer', () => {
    for (const page of pages) {
      expect(
        page.title.length,
        `${page.route} title "${page.title}" is ${page.title.length} chars (max 60)`
      ).toBeLessThanOrEqual(60);
    }
  });

  it('every page has a description', () => {
    for (const page of pages) {
      expect(page.description, `${page.route} should have a description`).toBeTruthy();
    }
  });

  it('every description is between 50 and 160 characters', () => {
    for (const page of pages) {
      const len = page.description.length;
      expect(
        len,
        `${page.route} description is ${len} chars (need 50-160): "${page.description}"`
      ).toBeGreaterThanOrEqual(50);
      expect(
        len,
        `${page.route} description is ${len} chars (need 50-160): "${page.description}"`
      ).toBeLessThanOrEqual(160);
    }
  });

  it('no two pages share the same title', () => {
    const titles = pages.map((p) => p.title);
    const unique = new Set(titles);
    expect(
      unique.size,
      `Found duplicate titles: ${titles.filter((t, i) => titles.indexOf(t) !== i).join(', ')}`
    ).toBe(titles.length);
  });

  it('no two pages share the same description', () => {
    const descriptions = pages.map((p) => p.description);
    const unique = new Set(descriptions);
    expect(
      unique.size,
      `Found duplicate descriptions among: ${pages
        .filter((p, i) => descriptions.indexOf(p.description) !== i)
        .map((p) => p.route)
        .join(', ')}`
    ).toBe(descriptions.length);
  });
});

describe('Dynamic Page Metadata - Blog Articles', () => {
  it('generateMetadata returns title and description for a known article', async () => {
    const mod = await import('../(main)/blog/[slug]/page');
    const generateMetadata = mod.generateMetadata;
    expect(generateMetadata).toBeDefined();
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'welcome-to-coronation-gardens' }) });
    expect(meta.title).toContain('Coronation Gardens');
    expect(meta.description).toBeTruthy();
    expect((meta.description as string).length).toBeGreaterThanOrEqual(50);
  });

  it('generateMetadata returns fallback for unknown slug', async () => {
    const mod = await import('../(main)/blog/[slug]/page');
    const meta = await mod.generateMetadata({ params: Promise.resolve({ slug: 'nonexistent-article' }) });
    expect(meta.title).toContain('Not Found');
  });
});

describe('Dynamic Page Metadata - Calendar Events', () => {
  it('generateMetadata returns title and description for a known event', async () => {
    const mod = await import('../(main)/calendar/[slug]/page');
    const generateMetadata = mod.generateMetadata;
    expect(generateMetadata).toBeDefined();
    const meta = await generateMetadata({ params: Promise.resolve({ slug: 'summer-barbecue' }) });
    expect(meta.title).toContain('Coronation Gardens');
    expect(meta.description).toBeTruthy();
  });

  it('generateMetadata returns fallback for unknown slug', async () => {
    const mod = await import('../(main)/calendar/[slug]/page');
    const meta = await mod.generateMetadata({ params: Promise.resolve({ slug: 'nonexistent-event' }) });
    expect(meta.title).toContain('Not Found');
  });
});
