'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import CategoryCard from './CategoryCard';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';
import type { CategoryStats } from '@/lib/api/discussions';

interface CategoryListProps extends HTMLAttributes<HTMLDivElement> {
  /** List of categories */
  categories: DiscussionCategory[];
  /** Statistics per category */
  stats?: Record<DiscussionCategorySlug, CategoryStats>;
  /** Currently active/selected category slug */
  activeCategory?: DiscussionCategorySlug;
  /** Callback when category is selected */
  onSelectCategory?: (slug: DiscussionCategorySlug) => void;
  /** Number of columns on desktop */
  columns?: 2 | 3 | 4;
  /** Loading state */
  isLoading?: boolean;
}

/**
 * Grid of category cards for the discussions landing page.
 * Displays all available categories with their stats.
 */
const CategoryList = forwardRef<HTMLDivElement, CategoryListProps>(
  ({
    categories,
    stats,
    activeCategory,
    onSelectCategory,
    columns = 3,
    isLoading = false,
    className,
    ...props
  }, ref) => {
    const columnClasses = {
      2: 'md:grid-cols-2',
      3: 'md:grid-cols-2 lg:grid-cols-3',
      4: 'md:grid-cols-2 lg:grid-cols-4',
    };

    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            'grid grid-cols-1 gap-4',
            columnClasses[columns],
            className
          )}
          {...props}
        >
          {[...Array(6)].map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'grid grid-cols-1 gap-4',
          columnClasses[columns],
          className
        )}
        {...props}
      >
        {categories.map((category) => (
          <CategoryCard
            key={category.slug}
            category={category}
            stats={stats?.[category.slug]}
            isActive={activeCategory === category.slug}
            onSelect={
              onSelectCategory
                ? () => onSelectCategory(category.slug)
                : undefined
            }
          />
        ))}
      </div>
    );
  }
);

CategoryList.displayName = 'CategoryList';

/**
 * Skeleton loader for category cards
 */
function CategoryCardSkeleton() {
  return (
    <div className="flex flex-col p-5 min-h-[160px] bg-white rounded-2xl border border-sage/30 animate-pulse">
      {/* Icon skeleton */}
      <div className="w-10 h-10 rounded-xl bg-sage-light mb-3" />

      {/* Title skeleton */}
      <div className="h-6 w-2/3 bg-sage-light rounded mb-2" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-3">
        <div className="h-4 w-full bg-sage-light rounded" />
        <div className="h-4 w-3/4 bg-sage-light rounded" />
      </div>

      {/* Stats skeleton */}
      <div className="mt-auto pt-3 border-t border-sage/30">
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-sage-light rounded" />
          <div className="h-4 w-16 bg-sage-light rounded" />
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
