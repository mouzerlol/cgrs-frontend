'use client';

import { NewsArticle } from '@/types';
import PageHeader from '@/components/sections/PageHeader';
import NewsContent from '@/components/news/NewsContent';

// Import data
import newsData from '@/data/news.json';

/**
 * News page with React Query and Suspense loading states.
 */
export default function NewsPage() {
  const articles = newsData.articles as NewsArticle[];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community News & Updates"
        description="Stay informed about the latest news, events, and important announcements from our community."
        eyebrow="News"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <NewsContent articles={articles} />
    </div>
  );
}
