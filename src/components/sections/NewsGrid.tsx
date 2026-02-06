'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { NewsArticle } from '@/types';
import { formatDate } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

interface NewsGridProps {
  articles: NewsArticle[];
  title?: string;
  eyebrow?: string;
  showViewAll?: boolean;
}

/**
 * News grid section with image cards.
 * Three-column layout on desktop.
 */
export default function NewsGrid({
  articles,
  title = 'Community<br>News',
  eyebrow = 'Latest Updates',
  showViewAll = true,
}: NewsGridProps) {
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="section bg-bone" id="news">
      <div className="container">
        <div
          ref={headerRef}
          className={`max-w-[600px] mb-10 md:mb-12 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">{eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: title }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-medium text-forest uppercase tracking-wider hover:text-terracotta transition-colors"
            >
              View All Blog Posts
              <Icon name="arrow-right" size="sm" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function NewsCard({ article }: { article: NewsArticle }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const imageUrl = article.image || 'https://placehold.co/800x600/f4a261/white?text=Community+News';

  return (
    <Link href={`/blog/${article.slug}`}>
      <article
        ref={ref}
        className={`card cursor-pointer fade-up ${isVisible ? 'visible' : ''}`}
      >
        <div className="card-image-wrapper">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="card-image"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="card-content">
          <p className="news-date">{formatDate(article.date)}</p>
          <h3 className="news-title">{article.title}</h3>
          <p className="news-excerpt">{article.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
