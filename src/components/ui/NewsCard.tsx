import Image from 'next/image';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { NewsArticle } from '@/types';
import { formatDate } from '@/lib/utils';

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const imageUrl = article.image || 'https://placehold.co/800x600/f4a261/white?text=Community+News';

  return (
    <Link href={`/blog/${article.slug}`}>
      <article
        ref={ref}
        className={`relative rounded-card overflow-hidden bg-white transition-transform duration-[400ms] hover:-translate-y-2 cursor-pointer fade-up ${isVisible ? 'visible' : ''}`}
      >
        <div className="relative h-[200px] md:h-[250px] overflow-hidden">
          <Image
            src={imageUrl}
            alt={article.title}
            fill
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <div className="p-md">
          <p className="text-xs text-terracotta font-medium uppercase tracking-[0.1em] mb-xs">{formatDate(article.date)}</p>
          <h3 className="font-display text-xl font-medium leading-snug mb-xs">{article.title}</h3>
          <p className="text-sm opacity-70 leading-relaxed">{article.excerpt}</p>
        </div>
      </article>
    </Link>
  );
}
