'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory } from '@/types';

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  categories: DiscussionCategory[];
  error?: string;
}

export function CategorySelect({
  value,
  onChange,
  categories,
  error,
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCategory = categories.find((c) => c.slug === value);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      terracotta: 'category-option-terracotta',
      forest: 'category-option-forest',
      sage: 'category-option-sage',
    };
    return colors[color] || 'category-option-sage';
  };

  return (
    <div className="category-select">
      <label className="category-label">
        Category <span className="text-terracotta">*</span>
      </label>

      <div className="category-dropdown-wrapper">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'category-dropdown-button',
            error && 'category-dropdown-button-error'
          )}
        >
          {selectedCategory ? (
            <div className="category-selected">
              <span className={cn('category-color-dot', `category-color-${selectedCategory.color}`)} />
              <span className="category-selected-name">{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="category-placeholder">Select a category</span>
          )}
          <ChevronDown className={cn('category-dropdown-icon', isOpen && 'category-dropdown-icon-open')} />
        </button>

        {isOpen && (
          <>
            <div className="category-dropdown-backdrop" onClick={() => setIsOpen(false)} />
            <div className="category-dropdown">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    onChange(category.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'category-option',
                    value === category.slug && 'category-option-selected',
                    getColorClass(category.color)
                  )}
                >
                  <span className={cn('category-option-color', `category-option-color-${category.color}`)} />
                  <div className="category-option-content">
                    <span className="category-option-name">{category.name}</span>
                    <span className="category-option-desc">{category.description}</span>
                  </div>
                  {value === category.slug && <Check className="category-option-check" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="category-error">{error}</p>}

      {selectedCategory && (
        <p className="category-selected-desc">{selectedCategory.description}</p>
      )}
    </div>
  );
}
