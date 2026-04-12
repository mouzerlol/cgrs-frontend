import { describe, it, expect } from 'vitest';
import newsData from '@/data/news.json';

/**
 * Validates that page metadata meets SEO requirements:
 * - Title: 30-60 characters (SEO best practice)
 * - Description: >=120 characters (minimum for search engines)
 */

describe('SEO Metadata Validation', () => {
  describe('Root Layout Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it.skip('root metadata title is between 30-60 characters', async () => {
      // Skipped: Fraunces font module loading issue in vitest
      const layout = await import('@/app/layout');
      const title = layout.metadata.title as string;
      expect(title.length).toBeGreaterThanOrEqual(TITLE_MIN);
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    });

    it.skip('root metadata description is at least 120 characters', async () => {
      // Skipped: Fraunces font module loading issue in vitest
      const layout = await import('@/app/layout');
      const description = layout.metadata.description as string;
      expect(description?.length).toBeGreaterThanOrEqual(DESC_MIN);
    });
  });

  describe('About Page Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it('about layout title is between 30-60 characters', async () => {
      const layout = await import('@/app/(main)/about/layout');
      const title = layout.metadata.title as string;
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeGreaterThanOrEqual(TITLE_MIN);
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
    });

    it('about layout description is at least 120 characters', async () => {
      const layout = await import('@/app/(main)/about/layout');
      const description = layout.metadata.description as string;
      expect(description?.length, `Description "${description}" is ${description?.length} chars`).toBeGreaterThanOrEqual(DESC_MIN);
    });
  });

  describe('Contact Page Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it('contact layout title is between 30-60 characters', async () => {
      const layout = await import('@/app/(main)/contact/layout');
      const title = layout.metadata.title as string;
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeGreaterThanOrEqual(TITLE_MIN);
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
    });

    it('contact layout description is at least 120 characters', async () => {
      const layout = await import('@/app/(main)/contact/layout');
      const description = layout.metadata.description as string;
      expect(description?.length, `Description "${description}" is ${description?.length} chars`).toBeGreaterThanOrEqual(DESC_MIN);
    });
  });

  describe('Management Request Page Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it('management-request layout title is between 30-60 characters', async () => {
      const layout = await import('@/app/(main)/management-request/layout');
      const title = layout.metadata.title as string;
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeGreaterThanOrEqual(TITLE_MIN);
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
    });

    it('management-request layout description is at least 120 characters', async () => {
      const layout = await import('@/app/(main)/management-request/layout');
      const description = layout.metadata.description as string;
      expect(description?.length, `Description "${description}" is ${description?.length} chars`).toBeGreaterThanOrEqual(DESC_MIN);
    });
  });

  describe('Blog Article Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it('all blog article titles plus suffix fit within 60 characters', () => {
      const articles = newsData.articles;
      const suffix = ' | Coronation Gardens';

      articles.forEach((article) => {
        const fullTitle = `${article.title}${suffix}`;
        expect(
          fullTitle.length,
          `Article "${article.title}" produces title "${fullTitle}" at ${fullTitle.length} chars`
        ).toBeLessThanOrEqual(TITLE_MAX);
      });
    });

    it('all blog article excerpts are at least 120 characters', () => {
      const articles = newsData.articles;

      articles.forEach((article) => {
        expect(
          article.excerpt.length,
          `Article "${article.title}" excerpt is ${article.excerpt.length} chars`
        ).toBeGreaterThanOrEqual(DESC_MIN);
      });
    });
  });

  describe('Calendar Page Metadata', () => {
    const TITLE_MIN = 30;
    const TITLE_MAX = 60;
    const DESC_MIN = 120;

    it('calendar layout title is between 30-60 characters', async () => {
      const layout = await import('@/app/(main)/calendar/layout');
      const title = layout.metadata.title as string;
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeGreaterThanOrEqual(TITLE_MIN);
      expect(title.length, `Title "${title}" is ${title.length} chars`).toBeLessThanOrEqual(TITLE_MAX);
    });

    it('calendar layout description is at least 120 characters', async () => {
      const layout = await import('@/app/(main)/calendar/layout');
      const description = layout.metadata.description as string;
      expect(description?.length, `Description "${description}" is ${description?.length} chars`).toBeGreaterThanOrEqual(DESC_MIN);
    });
  });
});
