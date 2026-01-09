import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getNewsArticles, getNewsArticle } from '@/lib/api/news';
import newsData from '@/data/news.json';

describe('News API', () => {
  describe('getNewsArticles', () => {
    it('returns all articles with correct types', async () => {
      const articles = await getNewsArticles();
      expect(articles).toHaveLength(newsData.articles.length);
      expect(articles[0]).toMatchObject({
        id: expect.any(String),
        title: expect.any(String),
        category: expect.stringMatching(/^(general|guidelines|events|maintenance|policy)$/),
      });
    });

    it('filters by category', async () => {
      const articles = await getNewsArticles({ category: 'general' });
      expect(articles.every(a => a.category === 'general')).toBe(true);
    });

    it('filters featured articles', async () => {
      const articles = await getNewsArticles({ featured: true });
      expect(articles.every(a => a.featured === true)).toBe(true);
    });

    it('limits results', async () => {
      const articles = await getNewsArticles({ limit: 2 });
      expect(articles.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getNewsArticle', () => {
    it('returns article by id', async () => {
      const article = await getNewsArticle('1');
      expect(article).not.toBeNull();
      expect(article?.id).toBe('1');
    });

    it('returns null for non-existent id', async () => {
      const article = await getNewsArticle('non-existent');
      expect(article).toBeNull();
    });

    it('returns article with correct types', async () => {
      const article = await getNewsArticle('1');
      expect(article).toMatchObject({
        id: '1',
        title: expect.any(String),
        category: expect.stringMatching(/^(general|guidelines|events|maintenance|policy)$/),
        featured: expect.any(Boolean),
      });
    });
  });
});
