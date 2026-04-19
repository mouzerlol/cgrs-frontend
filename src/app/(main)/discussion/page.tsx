'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import PageHeader from '@/components/sections/PageHeader';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';
import { SidebarLayout } from '@/components/shared/SidebarLayout';
import type { SidebarCategory } from '@/components/shared/SidebarLayout';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import ThreadList from '@/components/discussions/ThreadList';
import BookmarkedOnlyFilter from '@/components/discussions/BookmarkedOnlyFilter';
import SortDropdown from '@/components/discussions/SortDropdown';
import ViewToggle from '@/components/discussions/ViewToggle';
import { CategoryCTA } from '@/components/discussions/CategoryCTA';
import type { ThreadSortOption, Thread } from '@/types';
import {
  useBookmarkThread,
  useCategories,
  useCategoryStats,
  useInfiniteBookmarkedThreads,
  useInfiniteThreads,
  useReportThread,
  useUpvoteThread,
} from '@/hooks/useDiscussions';
import { sortDiscussionCategoriesByName } from '@/lib/discussion-category-order';
import { buildDiscussionSidebarStats } from '@/lib/discussion-sidebar-stats';
import { sortThreadsByOption } from '@/lib/discussion-sort';

/**
 * Community Discussion page with sidebar navigation.
 * Uses client-state for instant category switching without page reloads.
 * Matches the management-request pattern with folder-tab sidebar design.
 */
export default function DiscussionPage() {
  const { isSignedIn } = useAuth();

  // Category navigation state (null = "All Categories")
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Filter and view state
  const [sort, setSort] = useState<ThreadSortOption>('newest');
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');
  const [bookmarksOnly, setBookmarksOnly] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const sortedCategories = useMemo(() => sortDiscussionCategoriesByName(categories), [categories]);
  const { data: categoryStats = {}, isLoading: statsLoading } = useCategoryStats();
  const {
    data: threadData,
    isLoading: mainThreadsLoading,
    fetchNextPage: fetchNextMainPage,
    hasNextPage: hasNextMainPage,
    isFetchingNextPage: isFetchingNextMainPage,
  } = useInfiniteThreads(
    { category: activeCategory ?? undefined, sort },
    { enabled: !bookmarksOnly },
  );
  const {
    data: bookmarkedPages,
    isLoading: bookmarkedLoading,
    fetchNextPage: fetchNextBookmarkPage,
    hasNextPage: hasNextBookmarkPage,
    isFetchingNextPage: isFetchingNextBookmarkPage,
  } = useInfiniteBookmarkedThreads({ enabled: isSignedIn === true && bookmarksOnly });

  useEffect(() => {
    if (isSignedIn === false && bookmarksOnly) {
      setBookmarksOnly(false);
    }
  }, [isSignedIn, bookmarksOnly]);
  const upvoteThreadMutation = useUpvoteThread();
  const bookmarkThreadMutation = useBookmarkThread();
  const reportThreadMutation = useReportThread();
  const allThreads = useMemo(() => {
    const pages = bookmarksOnly ? bookmarkedPages?.pages : threadData?.pages;
    return (pages ?? []).flatMap((page) => page.threads) as Thread[];
  }, [bookmarksOnly, bookmarkedPages, threadData]);

  const displayThreads = useMemo(() => {
    let list = allThreads;
    if (bookmarksOnly && activeCategory) {
      list = list.filter((t) => t.category === activeCategory);
    }
    if (bookmarksOnly) {
      list = sortThreadsByOption(list, sort);
    }
    return list;
  }, [allThreads, bookmarksOnly, activeCategory, sort]);

  const fetchNextPage = bookmarksOnly ? fetchNextBookmarkPage : fetchNextMainPage;
  const hasNextPage = bookmarksOnly ? hasNextBookmarkPage : hasNextMainPage;
  const isFetchingNextPage = bookmarksOnly ? isFetchingNextBookmarkPage : isFetchingNextMainPage;
  const threadsLoading = bookmarksOnly ? bookmarkedLoading : mainThreadsLoading;

  // Sidebar badges: API totals normally; bookmark-only mode counts loaded bookmarked threads so badges match the list.
  const stats = useMemo(
    () =>
      buildDiscussionSidebarStats(bookmarksOnly, sortedCategories, categoryStats, allThreads),
    [bookmarksOnly, sortedCategories, categoryStats, allThreads],
  );

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
        eyebrowIconKey="messageSquare"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
        showBreadcrumbs={false}
      />

      <SiteBreadcrumbs variant="belowHero" />

      <section className="bg-bone pt-3 pb-xl md:pt-4 md:pb-2xl">
        <div className="container">
          <div className="mb-3 flex justify-end gap-3 sm:mb-4">
            <div className="flex items-center gap-2">
              <BookmarkedOnlyFilter
                pressed={bookmarksOnly}
                onPressedChange={setBookmarksOnly}
                disabled={isSignedIn !== true}
              />
              <SortDropdown value={sort} onChange={setSort} />
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <Link
                href={activeCategory ? `/discussion/new?category=${activeCategory}` : '/discussion/new'}
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
            categories={sortedCategories.map((c): SidebarCategory => ({
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
            <div className="flex min-h-0 flex-1 flex-col">
              {/* Thread List */}
              <ThreadList
                threads={displayThreads}
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
                  bookmarksOnly
                    ? activeCategory
                      ? 'No bookmarked threads in this category.'
                      : 'No bookmarked threads yet. Use the bookmark icon on a thread to save it here.'
                    : activeCategory
                      ? "No discussions in this category yet. Be the first to start one!"
                      : "No discussions yet. Be the first to start one!"
                }
              />

              {/* Load More */}
              {hasNextPage && (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
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

              {/* Category CTA — pinned to bottom of panel; panel padding matches inset above first thread */}
              {activeCategory && (() => {
                const cat = sortedCategories.find((c) => c.slug === activeCategory);
                return cat ? (
                  <CategoryCTA key={cat.slug} category={cat} threadCount={displayThreads.length} className="mt-auto" />
                ) : null;
              })()}
            </div>
          </SidebarLayout>
        </div>
      </section>
    </div>
  );
}
