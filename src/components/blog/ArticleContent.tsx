'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import { formatDate } from '@/lib/utils';
import BlogFeatureCard from './BlogFeatureCard';

interface ArticleContentProps {
  article: NewsArticle;
  relatedArticles: NewsArticle[];
}

export default function ArticleContent({ article, relatedArticles }: ArticleContentProps) {
  const imageUrl = article.image || '/images/news/welcome.svg';

  return (
    <article className="min-h-screen">
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-bone via-bone/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="container max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-forest/70 hover:text-forest mb-6 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-forest text-bone text-xs font-medium uppercase tracking-wider">
                {article.category}
              </span>
              {article.featured && (
                <span className="px-2 py-1 bg-terracotta text-bone text-xs font-medium rounded">
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium leading-tight text-forest mb-6">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-forest/60">
              <span className="font-medium text-forest">{article.author}</span>
              <span>•</span>
              <span>{formatDate(article.date)}</span>
              {article.readTime && (
                <>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-3xl py-12 md:py-16">
        <div className="prose prose-lg prose-forest max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            if (trimmed.startsWith('- ')) {
              const items = trimmed.split('\n').filter(i => i.trim().startsWith('- '));
              return (
                <ul key={index} className="list-disc list-inside space-y-2 my-6">
                  {items.map((item, i) => (
                    <li key={i}>{item.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }

            return <p key={index}>{trimmed}</p>;
          })}
        </div>
      </div>

      {relatedArticles.length > 0 && (
        <section className="bg-sage-light py-12 md:py-16">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl mb-8">Read Next</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((related) => (
                <BlogFeatureCard key={related.id} article={related} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
