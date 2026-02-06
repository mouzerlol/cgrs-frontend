'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface CategoryStats {
  threadCount: number;
  replyCount: number;
}

interface CategoryButtonBarProps {
  /** List of categories to display */
  categories: DiscussionCategory[];
  /** Statistics per category */
  stats?: Record<DiscussionCategorySlug, CategoryStats>;
  /** Additional class names */
  className?: string;
}

/**
 * 3x2 grid of category navigation buttons.
 * Each button links to the category subpage (e.g., /discussion/general).
 * Dark forest-light background with hover states.
 */
export default function CategoryButtonBar({
  categories,
  stats,
  className,
}: CategoryButtonBarProps) {
  // Icon background color classes (for the circular icon container)
  const iconBgClasses: Record<DiscussionCategory['color'], string> = {
    terracotta: 'bg-terracotta/20',
    forest: 'bg-bone/15',
    sage: 'bg-sage/30',
  };

  // Icon color classes
  const iconColorClasses: Record<DiscussionCategory['color'], string> = {
    terracotta: 'text-terracotta',
    forest: 'text-bone',
    sage: 'text-sage',
  };

  return (
    <div
      className={cn(
        'bg-forest-light rounded-2xl p-4 shadow-lg',
        className
      )}
    >
      {/* Grid of category buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((category) => {
          const threadCount = stats?.[category.slug as DiscussionCategorySlug]?.threadCount ?? 0;

          return (
            <Link
              key={category.slug}
              href={`/discussion/${category.slug}`}
              className={cn(
                'flex items-center gap-3 px-4 py-3',
                'rounded-xl transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-bone/30',
                'min-h-[80px]', // Touch-friendly height
                'bg-bone/10 text-bone hover:bg-bone/20',
                'group'
              )}
            >
              {/* Icon in colored circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  'transition-transform duration-200 group-hover:scale-110',
                  iconBgClasses[category.color]
                )}
              >
                <Icon
                  icon={category.icon}
                  className={cn('w-5 h-5', iconColorClasses[category.color])}
                />
              </div>

              {/* Name & Count */}
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium text-sm truncate">
                  {category.name}
                </div>
                <div className="text-xs text-bone/50">
                  {threadCount} {threadCount === 1 ? 'thread' : 'threads'}
                </div>
              </div>

              {/* Arrow indicator */}
              <Icon
                icon="lucide:chevron-right"
                className="w-4 h-4 text-bone/40 group-hover:text-bone/70 transition-colors flex-shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
