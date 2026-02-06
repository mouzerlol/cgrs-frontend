'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface BlogFeatureCardProps {
  article: NewsArticle;
}

export default function BlogFeatureCard({ article }: BlogFeatureCardProps) {
  const imageUrl = article.image || '/images/news/welcome.svg';

  return (
    <article className="group cursor-pointer">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="bg-white rounded-2xl overflow-hidden border border-sage/20 transition-all duration-400 hover:shadow-[0_12px_24px_rgba(26,34,24,0.1)] hover:-translate-y-1">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute top-3 right-3">
              <span className="px-2 py-1 bg-forest/90 text-bone text-xs font-medium rounded backdrop-blur-sm">
                {article.category}
              </span>
            </div>
          </div>

          <div className="p-5">
            <h3 className="font-display text-xl font-medium leading-snug mb-2 text-forest group-hover:text-forest-light transition-colors line-clamp-2">
              {article.title}
            </h3>

            <p className="text-forest/60 text-sm leading-relaxed mb-4 line-clamp-2">
              {article.excerpt}
            </p>

            <div className="flex items-center gap-3 text-xs text-forest/40">
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
      </Link>
    </article>
  );
}
