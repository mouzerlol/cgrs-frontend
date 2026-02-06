'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';
import { formatRelativeDate } from '@/lib/utils';

interface BlogCompactCardProps {
  article: NewsArticle;
}

export default function BlogCompactCard({ article }: BlogCompactCardProps) {
  const imageUrl = article.image || '/images/news/welcome.svg';

  return (
    <article className="group cursor-pointer">
      <Link href={`/blog/${article.slug}`} className="block">
        <div className="bg-white rounded-xl overflow-hidden border border-sage/20 transition-all duration-300 hover:border-sage hover:shadow-sm">
          <div className="flex">
            <div className="flex-1 p-4 flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-sage-light text-forest text-xs font-medium uppercase tracking-wider rounded">
                  {article.category}
                </span>
              </div>

              <h3 className="font-display text-base font-medium leading-snug text-forest group-hover:text-forest-light transition-colors line-clamp-2 mb-2">
                {article.title}
              </h3>

              <span className="text-xs text-forest/40">
                {formatRelativeDate(article.date)}
              </span>
            </div>

            <div className="relative w-32 h-28 flex-shrink-0 bg-sage-light overflow-hidden">
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-400 group-hover:scale-110"
                sizes="128px"
              />
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
