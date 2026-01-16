'use client';

import { forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory } from '@/types';

interface CategoryCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Category data */
  category: DiscussionCategory;
  /** Statistics for this category */
  stats?: {
    threadCount: number;
    replyCount: number;
  };
  /** Whether this category is currently selected/active */
  isActive?: boolean;
  /** Click handler (alternative to Link) */
  onSelect?: () => void;
}

/**
 * Category card for the discussions landing page.
 * Displays category info with thread/reply counts.
 * Clickable to navigate to category-filtered view.
 */
const CategoryCard = forwardRef<HTMLDivElement, CategoryCardProps>(
  ({ category, stats, isActive = false, onSelect, className, ...props }, ref) => {
    const colorClasses = {
      terracotta: {
        icon: 'bg-terracotta/10 text-terracotta',
        border: 'hover:border-terracotta/30',
        active: 'border-terracotta',
      },
      forest: {
        icon: 'bg-forest/10 text-forest',
        border: 'hover:border-forest/30',
        active: 'border-forest',
      },
      sage: {
        icon: 'bg-sage text-forest',
        border: 'hover:border-sage',
        active: 'border-sage',
      },
    };

    const colors = colorClasses[category.color];

    const CardContent = (
      <>
        {/* Icon */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
            colors.icon
          )}
        >
          <Icon icon={category.icon} className="w-5 h-5" />
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-medium text-forest mb-1">
          {category.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-forest/70 line-clamp-2 mb-3">
          {category.description}
        </p>

        {/* Stats */}
        {stats && (
          <div className="mt-auto pt-3 border-t border-sage/30">
            <div className="flex items-center gap-4 text-xs text-forest/50">
              <span className="flex items-center gap-1">
                <Icon icon="lucide:message-square" className="w-3.5 h-3.5" />
                {stats.threadCount} {stats.threadCount === 1 ? 'thread' : 'threads'}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="lucide:messages-square" className="w-3.5 h-3.5" />
                {stats.replyCount} {stats.replyCount === 1 ? 'reply' : 'replies'}
              </span>
            </div>
          </div>
        )}
      </>
    );

    const cardClasses = cn(
      'relative flex flex-col p-5 min-h-[160px]',
      'bg-white rounded-2xl border border-sage/30',
      'transition-all duration-300 cursor-pointer',
      'hover:-translate-y-1 hover:shadow-lg',
      colors.border,
      isActive && colors.active,
      className
    );

    // If onSelect is provided, use button behavior
    if (onSelect) {
      return (
        <div
          ref={ref}
          className={cardClasses}
          onClick={onSelect}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onSelect()}
          {...props}
        >
          {CardContent}
        </div>
      );
    }

    // Default: Link to category page
    return (
      <Link href={`/discussion/${category.slug}`} className="block">
        <div ref={ref} className={cardClasses} {...props}>
          {CardContent}
        </div>
      </Link>
    );
  }
);

CategoryCard.displayName = 'CategoryCard';

export default CategoryCard;
