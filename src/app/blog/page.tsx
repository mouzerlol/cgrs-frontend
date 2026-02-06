'use client';

import { NewsArticle } from '@/types';
import PageHeader from '@/components/sections/PageHeader';
import BlogListing from '@/components/blog/BlogListing';

import newsData from '@/data/news.json';

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

      <BlogListing articles={articles} />
    </div>
  );
}
