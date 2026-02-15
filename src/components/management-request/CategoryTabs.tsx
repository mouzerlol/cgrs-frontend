'use client';

import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { ManagementCategory, ManagementCategoryId } from '@/types/management-request';

interface CategoryTabsProps {
  categories: ManagementCategory[];
  activeCategory: ManagementCategoryId;
  onCategoryChange: (categoryId: ManagementCategoryId) => void;
}

/**
 * Desktop vertical folder-tab navigation for management request categories.
 * Uses a folder-tab metaphor where the active tab appears connected to the content panel.
 * Hidden on mobile (< lg breakpoint).
 */
export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <nav
      className="category-tabs hidden lg:flex flex-col w-64 flex-shrink-0"
      aria-label="Request categories"
    >
      <div className="category-tabs-list" role="tablist">
        {categories.map((category) => {
          const isActive = category.id === activeCategory;

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onCategoryChange(category.id)}
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
              <span className="category-tab-name">{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
