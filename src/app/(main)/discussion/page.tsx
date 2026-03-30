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
import type { ThreadSortOption, Thread } from '@/types';
import {
  useBookmarkThread,
  useCategories,
  useCategoryStats,
  useInfiniteThreads,
  useReportThread,
  useUpvoteThread,
} from '@/hooks/useDiscussions';

/**
 * Community Discussion page with sidebar navigation.
 * Uses client-state for instant category switching without page reloads.
 * Matches the management-request pattern with folder-tab sidebar design.
 */
export default function DiscussionPage() {
  // Category navigation state (null = "All Categories")
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter and view state
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: categoryStats = {}, isLoading: statsLoading } = useCategoryStats();
  const {
    data: threadData,
    isLoading: threadsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteThreads({ category: activeCategory ?? undefined, sort });
  const upvoteThreadMutation = useUpvoteThread();
  const bookmarkThreadMutation = useBookmarkThread();
  const reportThreadMutation = useReportThread();
  const allThreads = useMemo(
    () => (threadData?.pages ?? []).flatMap((page) => page.threads) as Thread[],
    [threadData],
  );

  // Calculate category stats
  const stats = useMemo(() => {
    const statsMap: Record<string, { threadCount: number; replyCount: number }> = {};

    categories.forEach((cat) => {
      statsMap[cat.slug] = {
        threadCount: categoryStats[cat.slug]?.threadCount ?? 0,
        replyCount: categoryStats[cat.slug]?.replyCount ?? 0,
      };
    });

    return statsMap;
  }, [categories, categoryStats]);

  const { upvotedThreads, bookmarkedThreads } = useMemo(() => ({
    upvotedThreads: new Set(allThreads.filter((t) => t.isUpvoted).map((t) => t.id)),
    bookmarkedThreads: new Set(allThreads.filter((t) => t.isBookmarked).map((t) => t.id)),
  }), [allThreads]);

  const handleUpvote = (threadId: string) => {
    upvoteThreadMutation.mutate(threadId);
  };

  const handleBookmark = (threadId: string) => {
    bookmarkThreadMutation.mutate(threadId);
  };

  const handleReport = async (threadId: string) => {
    const reason = prompt('Please provide a reason for reporting this thread:');
    if (!reason) return;
    await reportThreadMutation.mutateAsync({ id: threadId, reason });
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

      <section className="bg-bone pt-3 pb-xl md:pt-4 md:pb-2xl">
        <div className="container">
          <div className="mb-3 flex justify-end gap-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <SortDropdown value={sort} onChange={setSort} />
              <ViewToggle value={viewMode} onChange={setViewMode} />
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

          <SidebarLayout
            categories={categories.map((c): SidebarCategory => ({
              id: c.slug,
              name: c.name,
              icon: c.icon,
              count: stats[c.slug]?.threadCount,
            }))}
            activeCategory={activeCategory}
            onCategoryChange={(id) => setActiveCategory(id)}
            showAllOption
            allOptionLabel="All Categories"
            allOptionIcon="lucide:layout-grid"
            ariaLabel="Discussion categories"
          >
            {/* Thread List */}
            <ThreadList
              threads={allThreads}
              viewMode={viewMode}
              isLoading={categoriesLoading || statsLoading || threadsLoading}
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

            {/* Load More */}
            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <button
                  onClick={fetchNextPage}
                  disabled={isFetchingNextPage}
                  className={cn(
                    'inline-flex items-center gap-2 px-6 py-3',
                    'bg-sage-light text-forest rounded-xl',
                    'font-medium text-sm',
                    'transition-all duration-200',
                    'hover:bg-sage',
                    'focus:outline-none focus:ring-2 focus:ring-sage/50',
                    isFetchingNextPage && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more discussions'}
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
