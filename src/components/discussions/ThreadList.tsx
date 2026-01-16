'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ThreadCard from './ThreadCard';
import ThreadCardCompact from './ThreadCardCompact';
import ThreadCardSkeleton from './skeletons/ThreadCardSkeleton';
import type { Thread } from '@/types';

// Animation variants for staggered entrance
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const,
    },
  },
};

interface ThreadListProps extends HTMLAttributes<HTMLDivElement> {
  /** List of threads */
  threads: Thread[];
  /** View mode: card (default) or compact */
  viewMode?: 'card' | 'compact';
  /** Whether the current user has upvoted each thread */
  upvotedThreads?: Set<string>;
  /** Whether the current user has bookmarked each thread */
  bookmarkedThreads?: Set<string>;
  /** Callback when a thread is upvoted */
  onUpvote?: (threadId: string) => void;
  /** Callback when a thread is bookmarked */
  onBookmark?: (threadId: string) => void;
  /** Show category badge on each card */
  showCategory?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Number of skeleton items to show when loading */
  skeletonCount?: number;
  /** Message when list is empty */
  emptyMessage?: string;
}

/**
 * List of thread cards with view mode toggle support.
 * Supports both card view and compact row view.
 */
const ThreadList = forwardRef<HTMLDivElement, ThreadListProps>(
  ({
    threads,
    viewMode = 'card',
    upvotedThreads = new Set(),
    bookmarkedThreads = new Set(),
    onUpvote,
    onBookmark,
    showCategory = true,
    isLoading = false,
    skeletonCount = 5,
    emptyMessage = 'No discussions yet. Be the first to start one!',
    className,
    ...props
  }, ref) => {
    // Loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn('space-y-4', className)}
          {...props}
        >
          {[...Array(skeletonCount)].map((_, i) => (
            <ThreadCardSkeleton key={i} variant={viewMode} />
          ))}
        </div>
      );
    }

    // Empty state
    if (threads.length === 0) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col items-center justify-center py-16 text-center',
            className
          )}
          {...props}
        >
          <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-forest/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-forest/60 max-w-sm">{emptyMessage}</p>
        </div>
      );
    }

    // Card view
    if (viewMode === 'card') {
      return (
        <div ref={ref} {...props}>
          <motion.div
            className={cn('space-y-4', className)}
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {threads.map((thread) => (
              <motion.div key={thread.id} variants={itemVariants}>
                <ThreadCard
                  thread={thread}
                  hasUpvoted={upvotedThreads.has(thread.id)}
                  isBookmarked={bookmarkedThreads.has(thread.id)}
                  onUpvote={onUpvote ? () => onUpvote(thread.id) : undefined}
                  onBookmark={onBookmark ? () => onBookmark(thread.id) : undefined}
                  showCategory={showCategory}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      );
    }

    // Compact view
    return (
      <div ref={ref} {...props}>
        <motion.div
          className={cn('space-y-2', className)}
          variants={listVariants}
          initial="hidden"
          animate="visible"
        >
          {threads.map((thread) => (
            <motion.div key={thread.id} variants={itemVariants}>
              <ThreadCardCompact
                thread={thread}
                hasUpvoted={upvotedThreads.has(thread.id)}
                showCategory={showCategory}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }
);

ThreadList.displayName = 'ThreadList';

export default ThreadList;
