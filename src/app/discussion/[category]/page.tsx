'use client';

import React from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useCategory, useCategoryStats } from '@/hooks/useDiscussions';
import PageHeader from '@/components/sections/PageHeader';
import { DiscussionsContent } from '@/components/discussions';
import type { DiscussionCategorySlug } from '@/types';

/**
 * Category-specific discussion page.
 * Filters threads by category and displays category header with description.
 * Uses compact PageHeader variant for functional page styling.
 */
export default function CategoryPage() {
  const params = useParams();
  const categorySlug = (params.category as string) || '';

  // Handle reserved routes that should not be treated as categories
  if (categorySlug === 'new' || categorySlug === 'thread') {
    return null; // Let the actual route handle it
  }

  // Fetch category data
  const { data: category, isLoading: categoryLoading } = useCategory(categorySlug);

  // Fetch category stats
  const { data: categoryStats } = useCategoryStats();

  // Handle loading state
  if (categoryLoading) {
    return <CategoryPageLoading />;
  }

  // Handle invalid category
  if (!category) {
    notFound();
  }

  // Get stats for this category
  const stats = categoryStats?.[category.slug];
  const threadCount = stats?.threadCount || 0;
  const replyCount = stats?.replyCount || 0;

  // Get icon color class based on category color
  const colorClass = getCategoryColorClass(category.color);

  return (
    <div className="min-h-screen bg-bone">
      {/* Category Header - Compact variant */}
      <PageHeader
        title={category.name}
        description={category.description}
        eyebrow="Category"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />

      {/* Category Meta Bar */}
      <div className="bg-bone border-b border-sage/30">
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
            {/* Category Icon & Color */}
            <div className={cn('flex items-center gap-2', colorClass)}>
              <Icon icon={category.icon} className="w-5 h-5" />
              <span className="font-medium">{category.name}</span>
            </div>

            {/* Thread Count */}
            <div className="flex items-center gap-1.5 text-amber">
              <Icon icon="lucide:message-square" className="w-4 h-4" />
              <span>{threadCount} discussion{threadCount !== 1 ? 's' : ''}</span>
            </div>

            {/* Reply Count */}
            <div className="flex items-center gap-1.5 text-amber">
              <Icon icon="lucide:reply" className="w-4 h-4" />
              <span>{replyCount} repl{replyCount !== 1 ? 'ies' : 'y'}</span>
            </div>

            {/* Back to All Discussions */}
            <Link
              href="/discussion"
              className={cn(
                'ml-auto inline-flex items-center gap-1.5',
                'text-terracotta hover:text-terracotta-dark',
                'transition-colors duration-200'
              )}
            >
              <Icon icon="lucide:arrow-left" className="w-4 h-4" />
              <span>All Categories</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <DiscussionsContent
        category={category.slug as DiscussionCategorySlug}
        showCategoryBadges={false}
        showNewButton={true}
        title={category.name}
        eyebrow="Discussions"
      />
    </div>
  );
}

/**
 * Loading state component for category page.
 */
function CategoryPageLoading() {
  return (
    <div className="min-h-screen bg-bone">
      <section className="page-header pt-10 pb-3 md:pt-12 md:pb-4 relative overflow-hidden bg-forest">
        <div className="container relative z-10 flex items-center min-h-[120px]">
          <div className="max-w-xl space-y-3">
            <div className="h-4 w-16 bg-bone/30 rounded animate-pulse" />
            <div className="h-6 w-48 bg-bone/30 rounded animate-pulse" />
            <div className="h-4 w-72 bg-bone/30 rounded animate-pulse" />
          </div>
        </div>
      </section>
      <div className="bg-bone border-b border-sage/30 animate-pulse">
        <div className="container py-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-5 w-28 bg-sage/30 rounded" />
            <div className="h-5 w-20 bg-sage/30 rounded" />
            <div className="h-5 w-16 bg-sage/30 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Get color class based on category color.
 */
function getCategoryColorClass(color: string): string {
  switch (color) {
    case 'terracotta':
      return 'text-terracotta';
    case 'forest':
      return 'text-forest';
    case 'sage':
      return 'text-sage-dark';
    default:
      return 'text-forest';
  }
}
