'use client';

import Image from 'next/image';
import Link from 'next/link';
import { NewsArticle } from '@/types';

interface BlogMinimalCardProps {
  article: NewsArticle;
}

export default function BlogMinimalCard({ article }: BlogMinimalCardProps) {
  const imageUrl = article.image || '/images/news/welcome.svg';

  return (
    <article className="group cursor-pointer">
      <Link href={`/blog/${article.slug}`} className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-sage-light/50">
        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-sage-light">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="64px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-display text-sm font-medium leading-snug text-forest group-hover:text-forest-light transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </Link>
    </article>
  );
}
