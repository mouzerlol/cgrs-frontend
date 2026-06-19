'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import AccountSectionHeading from '@/components/profile/AccountSectionHeading';
import ThreadList from '@/components/discussions/ThreadList';
import ThreadCardSkeleton from '@/components/discussions/skeletons/ThreadCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Thread } from '@/types';
import { useBookmarkedThreads, useBookmarkThread, useUpvoteThread, useReportThread } from '@/hooks/useDiscussions';

export default function BookmarksSection() {
  const { data, isLoading, error } = useBookmarkedThreads();
  const bookmarkThreadMutation = useBookmarkThread();
  const upvoteThreadMutation = useUpvoteThread();
  const reportThreadMutation = useReportThread();

  const threads = useMemo(() => (data?.threads ?? []) as Thread[], [data?.threads]);

  const bookmarkedThreads = useMemo(
    () => new Set(threads.filter((t) => t.isBookmarked).map((t) => t.id)),
    [threads],
  );

  const handleBookmark = (threadId: string) => {
    bookmarkThreadMutation.mutate(threadId);
  };

  const handleUpvote = (threadId: string) => {
    upvoteThreadMutation.mutate(threadId);
  };

  const handleReport = async (threadId: string) => {
    const reason = prompt('Please provide a reason for reporting this thread:');
    if (!reason) return;
    await reportThreadMutation.mutateAsync({ id: threadId, reason });
  };

  const handleShare = (threadId: string) => {
    const url = `${window.location.origin}/discussion/thread/${threadId}`;
    navigator.clipboard.writeText(url);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ThreadCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>Failed to load bookmarked threads. Please try again later.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6 lg:pl-8 lg:[&>*:first-child]:-ml-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <AccountSectionHeading
        eyebrow="Bookmarks"
        title="Saved Threads"
        subtitle="Threads you have bookmarked for later reference."
        icon={Bookmark}
        action={
          <Link
            href="/discussion"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-bone transition-colors hover:bg-terracotta-dark"
          >
            <MessageSquare className="w-4 h-4" />
            Latest Discussion
          </Link>
        }
      />

      {/* Thread list or empty state */}
      {threads.length > 0 ? (
        <ThreadList
          threads={threads}
          viewMode="compact"
          bookmarkedThreads={bookmarkedThreads}
          onBookmark={handleBookmark}
          onUpvote={handleUpvote}
          onReport={handleReport}
          onShare={handleShare}
          showCategory
          emptyMessage="No bookmarked threads yet."
        />
      ) : (
        <EmptyState
          icon={<MessageSquare className="h-8 w-8 text-forest/40" />}
          title="No saved threads"
          description="Bookmark threads to save them here for easy access. Click the bookmark icon on any thread to save it."
          action={
            <Link
              href="/discussion"
              className="rounded-xl border border-sage/40 bg-bone px-4 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest/20 hover:bg-sage-light/50"
            >
              Browse discussions
            </Link>
          }
        />
      )}
    </motion.div>
  );
}
