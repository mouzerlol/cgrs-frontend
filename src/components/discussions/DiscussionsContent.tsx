'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useThreads } from '@/hooks/useDiscussions';
import ThreadList from './ThreadList';
import SearchBar from './SearchBar';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';
import type { ThreadSortOption, DiscussionCategorySlug } from '@/types';

interface DiscussionsContentProps {
  /** Filter by category slug */
  category?: DiscussionCategorySlug;
  /** Show category badges on thread cards */
  showCategoryBadges?: boolean;
  /** Show the "New Thread" button */
  showNewButton?: boolean;
  /** Section title */
  title?: string;
  /** Section eyebrow text */
  eyebrow?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Reusable thread list content with filters.
 * Used on both the landing page and category pages.
 */
export default function DiscussionsContent({
  category,
  showCategoryBadges = true,
  showNewButton = true,
  title = 'Discussions',
  eyebrow = 'Browse',
  className,
}: DiscussionsContentProps) {
  // State for filters
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');

  // Fetch threads with filters
  const { data: threadsData, isLoading } = useThreads({
    category,
    search: search || undefined,
    sort,
    limit: 20,
  });

  // Mock user interactions (will be replaced with real state in future)
  const [upvotedThreads] = useState<Set<string>>(new Set());
  const [bookmarkedThreads] = useState<Set<string>>(new Set());

  const handleUpvote = (threadId: string) => {
    console.log('Upvote:', threadId);
  };

  const handleBookmark = (threadId: string) => {
    console.log('Bookmark:', threadId);
  };

  return (
    <section className={cn('section bg-sage-light py-12', className)}>
      <div className="container">
        {/* Section Header with Controls */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Title Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-eyebrow text-terracotta">{eyebrow}</span>
              <h2 className="font-display text-2xl font-semibold text-forest mt-1">
                {title}
              </h2>
            </div>

            {/* New Thread Button */}
            {showNewButton && (
              <Link
                href={`/discussion/new${category ? `?category=${category}` : ''}`}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2.5',
                  'bg-terracotta text-bone rounded-xl',
                  'font-medium text-sm',
                  'transition-all duration-200',
                  'hover:bg-terracotta-dark hover:-translate-y-0.5',
                  'focus:outline-none focus:ring-2 focus:ring-terracotta/50'
                )}
              >
                <Icon icon="lucide:plus" className="w-5 h-5" />
                <span className="hidden sm:inline">Start Discussion</span>
                <span className="sm:hidden">New</span>
              </Link>
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search discussions..."
              />
            </div>

            {/* Sort & View Controls */}
            <div className="flex items-center gap-2">
              <SortDropdown value={sort} onChange={setSort} />
              <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Thread List */}
        <ThreadList
          threads={threadsData?.threads || []}
          viewMode={viewMode}
          upvotedThreads={upvotedThreads}
          bookmarkedThreads={bookmarkedThreads}
          onUpvote={handleUpvote}
          onBookmark={handleBookmark}
          showCategory={showCategoryBadges && !category}
          isLoading={isLoading}
          skeletonCount={5}
          emptyMessage={
            search
              ? `No discussions found for "${search}"`
              : 'No discussions yet. Be the first to start one!'
          }
        />

        {/* Load More */}
        {threadsData && threadsData.threads.length > 0 && threadsData.threads.length < threadsData.total && (
          <div className="flex justify-center mt-8">
            <button
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3',
                'bg-white text-forest rounded-xl border border-sage',
                'font-medium text-sm',
                'transition-all duration-200',
                'hover:bg-sage-light hover:border-forest/20'
              )}
            >
              <Icon icon="lucide:chevrons-down" className="w-5 h-5" />
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
