'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface BlogHeroCardProps {
  article: NewsArticle;
}

export default function BlogHeroCard({ article }: BlogHeroCardProps) {
  const imageUrl = article.image || '/images/news/welcome.svg';

  return (
    <article className="col-span-1 md:col-span-2 group cursor-pointer">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-sage/20 transition-all duration-400 hover:shadow-[0_20px_40px_rgba(26,34,24,0.12)]">
          <div className="grid md:grid-cols-2">
            <div className="relative h-64 md:h-full min-h-[300px] overflow-hidden bg-sage-light">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-center">
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

              <h2 className="font-display text-2xl md:text-3xl font-medium leading-tight mb-4 text-forest group-hover:text-forest-light transition-colors">
                {article.title}
              </h2>

              <p className="text-forest/70 mb-6 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center gap-4 text-sm text-forest/50">
                <span className="font-medium text-forest">{article.author}</span>
                <span>•</span>
                <span>{formatRelativeDate(article.date)}</span>
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
      </Link>
    </article>
  );
}
