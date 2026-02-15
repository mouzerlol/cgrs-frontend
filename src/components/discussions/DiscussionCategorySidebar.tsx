'use client';

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface CategoryStats {
  threadCount: number;
  replyCount: number;
}

interface DiscussionCategorySidebarProps {
  /** List of categories to display */
  categories: DiscussionCategory[];
  /** Statistics per category */
  stats?: Record<DiscussionCategorySlug, CategoryStats>;
  /** Currently active category (null = "All Categories") */
  activeCategory?: DiscussionCategorySlug | null;
  /** Callback when category changes */
  onCategoryChange: (slug: DiscussionCategorySlug | null) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Desktop vertical folder-tab navigation for discussion categories.
 * Uses a folder-tab metaphor where the active tab appears connected to the content panel.
 * Hidden on mobile (< lg breakpoint).
 */
export function DiscussionCategorySidebar({
  categories,
  stats,
  activeCategory,
  onCategoryChange,
  className,
}: DiscussionCategorySidebarProps) {
  return (
    <nav
      className={cn('category-tabs hidden lg:flex flex-col w-64 flex-shrink-0', className)}
      aria-label="Discussion categories"
    >
      <div className="category-tabs-list" role="tablist">
        {/* "All Categories" Tab */}
        <button
          type="button"
          onClick={() => onCategoryChange(null)}
          className={cn(
            'category-tab',
            activeCategory === null && 'category-tab-active'
          )}
          aria-selected={activeCategory === null}
          role="tab"
        >
          <span className="category-tab-icon">
            <Icon icon="lucide:layout-grid" width={20} height={20} />
          </span>
          <span className="category-tab-name">All Categories</span>
        </button>

        {/* Individual Category Tabs */}
        {categories.map((category) => {
          const isActive = category.slug === activeCategory;
          const threadCount = stats?.[category.slug]?.threadCount ?? 0;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => onCategoryChange(category.slug)}
              className={cn(
                'category-tab',
                isActive && 'category-tab-active'
              )}
              aria-selected={isActive}
              role="tab"
            >
              <span className="category-tab-icon">
                <Icon icon={category.icon} width={20} height={20} />
              </span>
              <span className="category-tab-name">
                {category.name}
                {threadCount > 0 && (
                  <span className="category-tab-count">
                    {threadCount}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
