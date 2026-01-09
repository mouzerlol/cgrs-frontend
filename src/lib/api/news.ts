import { NewsArticle } from '@/types';

interface NewsData {
  articles: NewsArticle[];
}

async function importNewsData(): Promise<NewsData> {
  const data = await import('@/data/news.json');
  return data.default as NewsData;
}

export async function getNewsArticles(options?: {
  limit?: number;
  category?: string;
  featured?: boolean;
}): Promise<NewsArticle[]> {
  const { articles } = await importNewsData();
  let result = articles;

  if (options?.category) {
    result = result.filter(a => a.category === options.category);
  }
  if (options?.featured) {
    result = result.filter(a => a.featured);
  }
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getNewsArticle(id: string): Promise<NewsArticle | null> {
  const { articles } = await importNewsData();
  return articles.find(a => a.id === id) || null;
}
