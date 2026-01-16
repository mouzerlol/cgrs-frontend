'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface CategoryBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Category object or just the slug */
  category: DiscussionCategory | DiscussionCategorySlug;
  /** Show icon alongside text */
  showIcon?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Categories data for slug lookup */
  categories?: DiscussionCategory[];
}

/** Default category metadata for slug-only usage */
const DEFAULT_CATEGORIES: Record<DiscussionCategorySlug, { name: string; icon: string; color: 'terracotta' | 'forest' | 'sage' }> = {
  announcements: { name: 'Announcements', icon: 'lucide:megaphone', color: 'terracotta' },
  parking: { name: 'Parking', icon: 'lucide:car', color: 'forest' },
  'waste-management': { name: 'Waste Management', icon: 'lucide:recycle', color: 'sage' },
  'questions-help': { name: 'Questions & Help', icon: 'lucide:help-circle', color: 'terracotta' },
  'neighborhood-watch': { name: 'Neighborhood Watch', icon: 'lucide:eye', color: 'forest' },
  general: { name: 'General', icon: 'lucide:message-circle', color: 'sage' },
};

/**
 * Small badge/tag displaying a discussion category.
 * Can accept full category object or just the slug.
 */
const CategoryBadge = forwardRef<HTMLSpanElement, CategoryBadgeProps>(
  ({ category, showIcon = true, size = 'sm', categories, className, ...props }, ref) => {
    // Resolve category data
    const categoryData = typeof category === 'string'
      ? categories?.find(c => c.slug === category) || { ...DEFAULT_CATEGORIES[category], slug: category }
      : category;

    const { name, icon, color } = typeof category === 'string'
      ? DEFAULT_CATEGORIES[category] || DEFAULT_CATEGORIES.general
      : category;

    const colorClasses = {
      terracotta: 'bg-terracotta/15 text-terracotta',
      forest: 'bg-forest/10 text-forest',
      sage: 'bg-sage text-forest',
    };

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-3 py-1 text-sm gap-1.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded font-semibold uppercase tracking-wide',
          colorClasses[color],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showIcon && (
          <Icon icon={icon} className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        )}
        <span>{name}</span>
      </span>
    );
  }
);

CategoryBadge.displayName = 'CategoryBadge';

export default CategoryBadge;
