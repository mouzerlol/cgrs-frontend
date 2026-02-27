'use client';

import { useState, useMemo } from 'react';
import PageHeader from '@/components/sections/PageHeader';
import { SidebarLayout } from '@/components/shared/SidebarLayout';
import type { SidebarCategory } from '@/components/shared/SidebarLayout';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import ThreadList from '@/components/discussions/ThreadList';
import SortDropdown from '@/components/discussions/SortDropdown';
import ViewToggle from '@/components/discussions/ViewToggle';
import type { DiscussionCategorySlug, ThreadSortOption, Thread, DiscussionCategory } from '@/types';

// Direct imports of data (build-time, works in client components)
import categoriesData from '@/data/forum-categories.json';
import discussionsData from '@/data/discussions.json';

/**
 * Community Discussion page with sidebar navigation.
 * Uses client-state for instant category switching without page reloads.
 * Matches the management-request pattern with folder-tab sidebar design.
 */
export default function DiscussionPage() {
  // Category navigation state (null = "All Categories")
  const [activeCategory, setActiveCategory] = useState<DiscussionCategorySlug | null>(null);

  // Filter and view state
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');

  // Get categories and threads from imported data
  const categories = categoriesData.categories as DiscussionCategory[];
  const allThreads = discussionsData.threads as Thread[];

  // Calculate category stats
  const stats = useMemo(() => {
    const statsMap: Record<DiscussionCategorySlug, { threadCount: number; replyCount: number }> = {} as any;

    categories.forEach(cat => {
      const categoryThreads = allThreads.filter(t => t.category === cat.slug);
      statsMap[cat.slug] = {
        threadCount: categoryThreads.length,
        replyCount: categoryThreads.reduce((sum, t) => sum + t.replyCount, 0),
      };
    });

    return statsMap;
  }, [categories, allThreads]);

  // Filter and sort threads
  const filteredThreads = useMemo(() => {
    let result = [...allThreads];

    // Filter by category
    if (activeCategory) {
      result = result.filter(thread => thread.category === activeCategory);
    }

    // Sort threads
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most-replies':
        result.sort((a, b) => b.replyCount - a.replyCount);
        break;
      case 'most-upvotes':
        result.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    return result;
  }, [allThreads, activeCategory, sort]);

  // Mock user interactions (will be replaced with real state management)
  const [upvotedThreads] = useState<Set<string>>(new Set());
  const [bookmarkedThreads] = useState<Set<string>>(new Set());

  const handleUpvote = (threadId: string) => {
    console.log('Upvote thread:', threadId);
  };

  const handleBookmark = (threadId: string) => {
    console.log('Bookmark thread:', threadId);
  };

  const handleReport = (threadId: string) => {
    console.log('Report thread:', threadId);
  };

  const handleShare = (threadId: string) => {
    const url = `${window.location.origin}/discussion/thread/${threadId}`;
    navigator.clipboard.writeText(url);
    console.log('Shared thread:', threadId);
  };

  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Community Discussion"
        description="Connect with your neighbors, share ideas, and stay informed."
        eyebrow="Forum"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />

      <section className="section bg-bone">
        <div className="container">
          <SidebarLayout
            categories={categories.map((c): SidebarCategory => ({
              id: c.slug,
              name: c.name,
              icon: c.icon,
              count: stats[c.slug]?.threadCount,
            }))}
            activeCategory={activeCategory}
            onCategoryChange={(id) => setActiveCategory(id as DiscussionCategorySlug | null)}
            showAllOption
            allOptionLabel="All Categories"
            allOptionIcon="lucide:layout-grid"
            ariaLabel="Discussion categories"
          >
            {/* Controls Row - Search, Sort, View, New Button */}
            <div className="flex justify-end gap-3 mb-4">
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

            {/* Thread List */}
            <ThreadList
              threads={filteredThreads}
              viewMode={viewMode}
              isLoading={false}
              skeletonCount={6}
              upvotedThreads={upvotedThreads}
              bookmarkedThreads={bookmarkedThreads}
              onUpvote={handleUpvote}
              onBookmark={handleBookmark}
              onReport={handleReport}
              onShare={handleShare}
              showCategory={activeCategory === null}
              emptyMessage={
                activeCategory
                  ? "No discussions in this category yet. Be the first to start one!"
                  : "No discussions yet. Be the first to start one!"
              }
            />

            {/* Load More (pagination placeholder) */}
            {filteredThreads.length > 20 && (
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
          </SidebarLayout>
        </div>
      </section>
    </div>
  );
}
