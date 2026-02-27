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

  const getDotColorClass = (color: string) => {
    const colors: Record<string, string> = {
      terracotta: 'bg-terracotta',
      forest: 'bg-forest',
      sage: 'bg-sage',
    };
    return colors[color] || 'bg-sage';
  };

  return (
    <div className="flex flex-col gap-xs">
      <label className="text-sm font-medium text-forest">
        Category <span className="text-terracotta">*</span>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full p-md bg-white border border-sage rounded-xl flex items-center justify-between cursor-pointer transition-all duration-[250ms] ease-out-custom text-left hover:border-forest focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10',
            error && 'border-terracotta'
          )}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-sm">
              <span className={cn('w-3 h-3 rounded-full shrink-0', getDotColorClass(selectedCategory.color))} />
              <span className="text-base text-forest">{selectedCategory.name}</span>
            </div>
          ) : (
            <span className="text-forest/50">Select a category</span>
          )}
          <ChevronDown
            className={cn(
              'w-5 h-5 text-forest/50 transition-transform duration-[250ms] ease-out-custom',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-sage rounded-xl shadow-[0_8px_24px_rgba(26,34,24,0.12)] z-50 max-h-[320px] overflow-visible">
              {categories.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    onChange(category.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full p-md flex items-start gap-sm cursor-pointer transition-colors duration-[250ms] ease-out-custom text-left border-none bg-transparent hover:bg-sage-light',
                    value === category.slug && 'bg-sage-light'
                  )}
                >
                  <span className={cn('w-3 h-3 rounded-full shrink-0 mt-1', getDotColorClass(category.color))} />
                  <div className="flex-1 min-w-0">
                    <span className="block text-base font-medium text-forest">{category.name}</span>
                    <span className="block text-sm text-forest/60 mt-0.5">{category.description}</span>
                  </div>
                  {value === category.slug && <Check className="w-5 h-5 text-forest shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      {selectedCategory && (
        <p className="text-sm text-forest/70 mt-xs">{selectedCategory.description}</p>
      )}
    </div>
  );
}
