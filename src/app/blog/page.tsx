'use client';

import { NewsArticle } from '@/types';
import PageHeader from '@/components/sections/PageHeader';
import NewsContent from '@/components/news/NewsContent';

// Import data
import newsData from '@/data/news.json';

/**
 * Blog page with React Query and Suspense loading states.
 */
export default function BlogPage() {
  const articles = newsData.articles as NewsArticle[];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="CGRS Committee Blog"
        description="Latest updates and announcements from the committee and website team."
        eyebrow="Blog"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <NewsContent articles={articles} />
    </div>
  );
}
