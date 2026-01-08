'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/sections/PageHeader';
import { formatDate } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

// Import data
import newsData from '@/data/news.json';

const CATEGORIES = [
  { key: 'all', label: 'All News' },
  { key: 'general', label: 'General' },
  { key: 'guidelines', label: 'Guidelines' },
  { key: 'events', label: 'Events' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'policy', label: 'Policy' },
];

/**
 * News page with new design system.
 */
export default function NewsPage() {
  const articles = newsData.articles as NewsArticle[];
  const featuredArticle = articles.find(article => article.featured);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community News & Updates"
        description="Stay informed about the latest news, events, and important announcements from our community."
        eyebrow="News"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Categories Filter */}
      <section className="py-6 bg-white border-b border-sage/20">
        <div className="container">
          <div className="flex flex-wrap gap-2 justify-center">
            {CATEGORIES.map((category) => (
              <button
                key={category.key}
                className={`px-4 py-2 rounded text-sm font-medium transition-all duration-300 ${
                  category.key === 'all'
                    ? 'bg-forest text-bone'
                    : 'bg-sage-light text-forest hover:bg-sage'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && (
        <section className="section bg-bone">
          <div className="container">
            <span className="text-eyebrow block mb-6">Featured Article</span>
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/3 h-64 md:h-auto relative bg-sage-light">
                  {featuredArticle.image ? (
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl opacity-30">📰</span>
                    </div>
                  )}
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded bg-sage-light text-forest text-xs font-medium uppercase tracking-wider">
                      {featuredArticle.category}
                    </span>
                    <span className="text-sm opacity-50">
                      {formatDate(featuredArticle.date)}
                    </span>
                  </div>
                  <h3 className="font-display text-2xl font-medium mb-4">
                    {featuredArticle.title}
                  </h3>
                  <p className="opacity-70 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <div className="prose prose-sm max-w-none opacity-70">
                    {featuredArticle.content.split('\n').slice(0, 2).map((paragraph, index) => (
                      paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* All Articles */}
      <section className="section bg-sage-light">
        <div className="container">
          <span className="text-eyebrow block mb-6">All Articles</span>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* Archive Section */}
      <section className="section bg-bone">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Archive</span>
            <h2>Browse Past Articles</h2>
            <p className="mt-4 opacity-70 max-w-xl mx-auto">
              Looking for older articles? Browse our archive by month and year.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {['January 2024', 'December 2023', 'November 2023'].map((month, index) => (
              <Card key={month} hover className="text-center p-6">
                <h3 className="font-display text-lg font-medium mb-2">{month}</h3>
                <p className="text-sm opacity-50 mb-4">
                  {index === 0 ? `${articles.length} articles` : '0 articles'}
                </p>
                <Button variant={index === 0 ? 'outline' : 'ghost'} size="sm" disabled={index !== 0}>
                  Browse
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });
  const imageUrl = article.image || 'https://placehold.co/800x600/f4a261/white?text=News+Update';

  return (
    <article
      ref={ref}
      className={`card fade-up ${isVisible ? 'visible' : ''}`}
    >
      <div className="card-image-wrapper">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="card-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {article.featured && (
          <span className="absolute top-3 right-3 px-2 py-1 bg-terracotta text-bone text-xs font-medium rounded">
            Featured
          </span>
        )}
      </div>
      <div className="card-content">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-sage-light text-forest text-xs font-medium uppercase tracking-wider">
            {article.category}
          </span>
        </div>
        <p className="news-date">{formatDate(article.date)}</p>
        <h3 className="news-title">{article.title}</h3>
        <p className="news-excerpt">{article.excerpt}</p>
        <Button variant="ghost" size="sm" className="mt-4" asChild>
          <Link href={`#${article.id}`}>Read More →</Link>
        </Button>
      </div>
    </article>
  );
}
