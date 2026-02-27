'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { useCategories, useCategoryStats, useThreadsWithLatestReply } from '@/hooks/useDiscussions';
import CategoryButtonBar from './CategoryButtonBar';
import SortDropdown from './SortDropdown';
import ViewToggle from './ViewToggle';
import ThreadList from './ThreadList';
import type { ThreadSortOption } from '@/types';

interface DiscussionsLandingProps {
  /** Additional class names */
  className?: string;
}

/**
 * Main landing page content for /discussion.
 * Features a 3x2 category button bar for navigation and a thread list showing all discussions.
 * Categories link to their respective subpages for filtered views.
 */
export default function DiscussionsLanding({ className }: DiscussionsLandingProps) {
  // State for filters
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: categoryStats } = useCategoryStats();

  // Fetch all threads with latest reply info
  const { data: threadsData, isLoading: threadsLoading } = useThreadsWithLatestReply({
    sort,
  });

  // Mock user interactions (will be replaced with real state management)
  const [upvotedThreads] = useState<Set<string>>(new Set());
  const [bookmarkedThreads] = useState<Set<string>>(new Set());

  const handleUpvote = (threadId: string) => {
    // Future: API call to toggle upvote
    console.log('Upvote thread:', threadId);
  };

  const handleBookmark = (threadId: string) => {
    // Future: API call to toggle bookmark
    console.log('Bookmark thread:', threadId);
  };

  const handleReport = (threadId: string) => {
    // Future: Open report modal
    console.log('Report thread:', threadId);
  };

  const handleShare = (threadId: string) => {
    // Copy thread URL to clipboard
    const url = `${window.location.origin}/discussion/thread/${threadId}`;
    navigator.clipboard.writeText(url);
    // Future: Show toast notification
    console.log('Shared thread:', threadId);
  };

  return (
    <div className={cn('bg-bone', className)}>
      {/* Unified Content Section */}
      <section className="py-4 md:py-6">
        <div className="container space-y-4">
          {/* Controls Row - Search, Sort, View, New Button */}
          <div className="flex flex-col sm:flex-row gap-3">
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

          {/* Category Button Bar - Links to subpages */}
          {!categoriesLoading && categories && (
            <CategoryButtonBar
              categories={categories}
              stats={categoryStats}
            />
          )}

          {/* Thread List - Shows all discussions */}
          <div className="pt-2">
            <ThreadList
              threads={threadsData?.threads ?? []}
              viewMode={viewMode}
              isLoading={threadsLoading}
              skeletonCount={6}
              upvotedThreads={upvotedThreads}
              bookmarkedThreads={bookmarkedThreads}
              onUpvote={handleUpvote}
              onBookmark={handleBookmark}
              onReport={handleReport}
              onShare={handleShare}
              showCategory={true}
              emptyMessage="No discussions yet. Be the first to start one!"
            />
          </div>

          {/* Load More (pagination placeholder) */}
          {threadsData && threadsData.threads.length > 0 && threadsData.threads.length < threadsData.total && (
            <div className="pt-4 flex justify-center">
              <button
                className={cn(
                  'inline-flex items-center gap-2 px-6 py-3',
                  'bg-sage-light text-forest rounded-xl',
                  'font-medium text-sm',
                  'transition-all duration-200',
                  'hover:bg-sage',
                  'focus:outline-none focus:ring-2 focus:ring-sage/50'
                )}
              >
                Load more discussions
                <Icon icon="lucide:chevron-down" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
