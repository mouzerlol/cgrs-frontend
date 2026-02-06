'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

interface CategoryStats {
  threadCount: number;
  replyCount: number;
}

interface DiscussionCategoryDropdownProps {
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
 * Mobile dropdown selector for discussion categories.
 * Displayed only on mobile (< lg breakpoint).
 * Uses a custom dropdown for consistent styling across browsers.
 */
export function DiscussionCategoryDropdown({
  categories,
  stats,
  activeCategory,
  onCategoryChange,
  className,
}: DiscussionCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find active category or use "All Categories"
  const activeItem = activeCategory
    ? categories.find((cat) => cat.slug === activeCategory)
    : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (slug: DiscussionCategorySlug | null) => {
    onCategoryChange(slug);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className={cn('category-dropdown lg:hidden relative mb-6', className)}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="category-dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="category-dropdown-selected">
          {activeItem ? (
            <>
              <Icon icon={activeItem.icon} width={20} height={20} />
              <span>{activeItem.name}</span>
            </>
          ) : (
            <>
              <Icon icon="lucide:layout-grid" width={20} height={20} />
              <span>All Categories</span>
            </>
          )}
        </span>
        <Icon
          icon="lucide:chevron-down"
          width={20}
          height={20}
          className={cn(
            'category-dropdown-chevron transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <ul
          className="category-dropdown-menu"
          role="listbox"
          aria-activedescendant={activeCategory ?? 'all-categories'}
        >
          {/* "All Categories" Option */}
          <li>
            <button
              type="button"
              role="option"
              aria-selected={activeCategory === null}
              onClick={() => handleSelect(null)}
              className={cn(
                'category-dropdown-option',
                activeCategory === null && 'category-dropdown-option-active'
              )}
            >
              <Icon icon="lucide:layout-grid" width={20} height={20} />
              <span>All Categories</span>
              {activeCategory === null && (
                <Icon
                  icon="lucide:check"
                  width={18}
                  height={18}
                  className="ml-auto text-terracotta"
                />
              )}
            </button>
          </li>

          {/* Individual Categories */}
          {categories.map((category) => {
            const isActive = category.slug === activeCategory;
            const threadCount = stats?.[category.slug]?.threadCount ?? 0;

            return (
              <li key={category.slug}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(category.slug)}
                  className={cn(
                    'category-dropdown-option',
                    isActive && 'category-dropdown-option-active'
                  )}
                >
                  <Icon icon={category.icon} width={20} height={20} />
                  <span>
                    {category.name}
                    {threadCount > 0 && (
                      <span className="text-xs text-forest/50 ml-2">
                        ({threadCount})
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <Icon
                      icon="lucide:check"
                      width={18}
                      height={18}
                      className="ml-auto text-terracotta"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
