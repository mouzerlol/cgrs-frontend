'use client';

import { useState, useMemo } from 'react';
import { NewsArticle } from '@/types';
import BlogHeroCard from './BlogHeroCard';
import BlogFeatureCard from './BlogFeatureCard';
import BlogCompactCard from './BlogCompactCard';
import BlogMinimalCard from './BlogMinimalCard';

interface BlogListingProps {
  articles: NewsArticle[];
}

const CATEGORIES = [
  { key: 'all', label: 'All Posts' },
  { key: 'general', label: 'General' },
  { key: 'guidelines', label: 'Guidelines' },
  { key: 'events', label: 'Events' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'policy', label: 'Policy' },
];

type CategoryKey = typeof CATEGORIES[number]['key'];

function CategoryFilter({
  activeCategory,
  onCategoryChange,
}: {
  activeCategory: CategoryKey;
  onCategoryChange: (category: CategoryKey) => void;
}) {
  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
      {CATEGORIES.map((category) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
            category.key === activeCategory
              ? 'bg-forest text-bone'
              : 'bg-sage-light/50 text-forest hover:bg-sage-light'
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}

export default function BlogListing({ articles }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all');

  const filteredArticles = useMemo(() => {
    let sorted = [...articles].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (activeCategory !== 'all') {
      const categoryArticles = sorted.filter((a) => a.category === activeCategory);
      const otherArticles = sorted.filter((a) => a.category !== activeCategory);
      return [...categoryArticles, ...otherArticles];
    }

    return sorted;
  }, [articles, activeCategory]);

  const heroArticle = filteredArticles[0];
  const featureArticles = filteredArticles.slice(1, 3);
  const compactArticles = filteredArticles.slice(3, 7);
  const minimalArticles = filteredArticles.slice(7);

  return (
    <div>
      <div className="sticky top-[72px] z-40 bg-bone/95 backdrop-blur-sm py-4 border-b border-sage/20">
        <div className="container">
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="container py-20 text-center">
          <p className="text-forest/50">No articles found in this category.</p>
        </div>
      ) : (
        <div className="container py-8 pb-20 space-y-8">
          {heroArticle && <BlogHeroCard article={heroArticle} />}

          {featureArticles.length > 0 && (
            <section>
              <h3 className="text-eyebrow mb-4">Recent Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featureArticles.map((article) => (
                  <BlogFeatureCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {compactArticles.length > 0 && (
            <section>
              <h3 className="text-eyebrow mb-4">More Stories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {compactArticles.map((article) => (
                  <BlogCompactCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {minimalArticles.length > 0 && (
            <section>
              <h3 className="text-eyebrow mb-4">Earlier Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {minimalArticles.map((article) => (
                  <BlogMinimalCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
