'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useCategories, useCategoryStats } from '@/hooks/useDiscussions';
import CategoryAccordion from './CategoryAccordion';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';
import type { ThreadSortOption } from '@/types';

interface DiscussionsLandingProps {
  /** Additional class names */
  className?: string;
}

/**
 * Main landing page content for /discussion.
 * Unified layout with compact category accordion and thread list.
 * Optimized for content density - threads visible above the fold.
 */
export default function DiscussionsLanding({ className }: DiscussionsLandingProps) {
  // State for filters
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('card');

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: categoryStats } = useCategoryStats();

  return (
    <div className={cn('bg-bone', className)}>
      {/* Unified Content Section */}
      <section className="py-4 md:py-6">
        <div className="container space-y-4">
          {/* Controls Row - Search, Sort, View, New Button - Above Accordion */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search discussions..."
              />
            </div>

            {/* Sort, View Toggle & New Button */}
            <div className="flex items-center gap-2">
              <SortDropdown value={sort} onChange={setSort} />
              <ViewToggle value={viewMode} onChange={setViewMode} />

              {/* Start Discussion Button */}
              <Link
                href="/discussion/new"
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5',
                  'bg-terracotta text-bone rounded-xl',
                  'font-medium text-sm',
                  'transition-all duration-200',
                  'hover:bg-terracotta-dark hover:-translate-y-0.5',
                  'hover:shadow-[0_6px_20px_rgba(217,93,57,0.35)]',
                  'focus:outline-none focus:ring-2 focus:ring-terracotta/50'
                )}
              >
                <Icon icon="lucide:plus" className="w-4 h-4" />
                <span className="hidden sm:inline">New</span>
              </Link>
            </div>
          </div>

          {/* Category Accordion - Compact navigation */}
          {!categoriesLoading && categories && (
            <CategoryAccordion
              categories={categories}
              stats={categoryStats}
              defaultExpanded={false}
            />
          )}

          {/* Inline Stats Bar */}
          <div className="pt-6 mt-4 border-t border-sage/30">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-amber">
              <div className="flex items-center gap-2">
                <Icon icon="lucide:folder" className="w-4 h-4" />
                <span>
                  <strong className="text-forest">{categories?.length || 0}</strong> categories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Icon icon="lucide:users" className="w-4 h-4" />
                <span className="text-forest/60">Community-driven</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
