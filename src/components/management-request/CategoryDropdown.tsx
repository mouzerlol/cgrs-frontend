'use client';

import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { ManagementCategory, ManagementCategoryId } from '@/types/management-request';

interface CategoryDropdownProps {
  categories: ManagementCategory[];
  activeCategory: ManagementCategoryId;
  onCategoryChange: (categoryId: ManagementCategoryId) => void;
}

/**
 * Mobile dropdown selector for management request categories.
 * Displayed only on mobile (< lg breakpoint).
 * Uses a custom dropdown for consistent styling across browsers.
 */
export function CategoryDropdown({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeItem = categories.find((cat) => cat.id === activeCategory);

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

  const handleSelect = (categoryId: ManagementCategoryId) => {
    onCategoryChange(categoryId);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="category-dropdown lg:hidden relative mb-6"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="category-dropdown-trigger"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="category-dropdown-selected">
          {activeItem && (
            <>
              <Icon icon={activeItem.icon} width={20} height={20} />
              <span>{activeItem.name}</span>
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
          aria-activedescendant={activeCategory}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategory;

            return (
              <li key={category.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(category.id)}
                  className={cn(
                    'category-dropdown-option',
                    isActive && 'category-dropdown-option-active'
                  )}
                >
                  <Icon icon={category.icon} width={20} height={20} />
                  <span>{category.name}</span>
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
