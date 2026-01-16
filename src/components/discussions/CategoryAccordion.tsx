'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useThreads } from '@/hooks/useDiscussions';
import ThreadCard from './ThreadCard';
import type { DiscussionCategory, DiscussionCategorySlug, Thread } from '@/types';

interface CategoryStats {
  threadCount: number;
  replyCount: number;
}

interface CategoryAccordionProps {
  /** List of categories to display */
  categories: DiscussionCategory[];
  /** Statistics per category */
  stats?: Record<DiscussionCategorySlug, CategoryStats>;
  /** Additional class names */
  className?: string;
}

/**
 * Forest-themed accordion for browsing discussion categories.
 * Each category expands to show thread previews within that category.
 * Dark forest-light background with bone/white text for contrast.
 */
export default function CategoryAccordion({
  categories,
  stats,
  className,
}: CategoryAccordionProps) {
  // Track which categories are expanded (multiple can be open at once)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleToggle = (slug: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  const isExpanded = (slug: string) => expandedCategories.has(slug);

  return (
    <div
      className={cn(
        'bg-forest-light rounded-2xl overflow-hidden',
        'shadow-lg',
        className
      )}
    >
      {/* Accordion Header */}
      <div className="px-5 py-4 border-b border-bone/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bone/10 flex items-center justify-center">
            <Icon icon="lucide:folder" className="w-4 h-4 text-bone" />
          </div>
          <div>
            <h3 className="font-display font-medium text-bone text-lg">
              Browse by Topic
            </h3>
            <p className="text-bone/60 text-sm">
              {categories.length} categories
            </p>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="divide-y divide-bone/10">
        {categories.map((category) => (
          <CategoryItem
            key={category.slug}
            category={category}
            stats={stats?.[category.slug as DiscussionCategorySlug]}
            isExpanded={isExpanded(category.slug)}
            onToggle={() => handleToggle(category.slug)}
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: DiscussionCategory;
  stats?: CategoryStats;
  isExpanded: boolean;
  onToggle: () => void;
}

function CategoryItem({ category, stats, isExpanded, onToggle }: CategoryItemProps) {
  // Fetch threads for this category when expanded
  const { data: threadsData, isLoading } = useThreads({
    category: category.slug as DiscussionCategorySlug,
    limit: 5,
  });

  const threads = threadsData?.threads || [];
  const threadCount = stats?.threadCount ?? 0;

  // Icon color classes - lighter versions for dark background
  const iconColorClasses = {
    terracotta: 'bg-terracotta/20 text-terracotta',
    forest: 'bg-bone/15 text-bone',
    sage: 'bg-sage/30 text-sage',
  };

  const iconColors = iconColorClasses[category.color] || iconColorClasses.forest;

  // Mock user interactions for ThreadCard in accordion
  const [upvotedThreads] = useState<Set<string>>(new Set());
  const [bookmarkedThreads] = useState<Set<string>>(new Set());

  const handleUpvote = (_threadId: string) => {
    // Future: API call to toggle upvote
  };

  const handleBookmark = (_threadId: string) => {
    // Future: API call to toggle bookmark
  };

  return (
    <div>
      {/* Category Header - Clickable */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-4 px-5 py-4',
          'text-left transition-colors duration-200',
          'hover:bg-bone/5',
          'focus:outline-none focus:bg-bone/5'
        )}
        aria-expanded={isExpanded}
      >
        {/* Icon */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconColors)}>
          <Icon icon={category.icon} className="w-5 h-5" />
        </div>

        {/* Title & Count */}
        <div className="flex-1 min-w-0">
          <h4 className="font-display font-medium text-bone truncate">
            {category.name}
          </h4>
          <p className="text-bone/50 text-sm">
            {threadCount} {threadCount === 1 ? 'discussion' : 'discussions'}
          </p>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          className="flex-shrink-0"
        >
          <Icon icon="lucide:chevron-down" className="w-5 h-5 text-bone/60" />
        </motion.div>
      </button>

      {/* Expanded Content - Thread Cards */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">
              {/* Thread Cards */}
              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeletons
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-bone/5 rounded-xl p-4 animate-pulse">
                        <div className="h-5 bg-bone/10 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-bone/10 rounded w-1/2 mb-3" />
                        <div className="h-3 bg-bone/10 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : threads.length > 0 ? (
                  // Thread cards with white background
                  threads.map((thread) => (
                    <ThreadCard
                      key={thread.id}
                      thread={thread}
                      hasUpvoted={upvotedThreads.has(thread.id)}
                      isBookmarked={bookmarkedThreads.has(thread.id)}
                      onUpvote={() => handleUpvote(thread.id)}
                      onBookmark={() => handleBookmark(thread.id)}
                      showCategory={false}
                      className="bg-white"
                    />
                  ))
                ) : (
                  // Empty state
                  <div className="px-4 py-6 text-center">
                    <p className="text-bone/50 text-sm">No discussions yet in this category</p>
                  </div>
                )}

                {/* View All Link */}
                {threads.length > 0 && (
                  <Link
                    href={`/discussion/${category.slug}`}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-3',
                      'bg-bone/5 text-amber text-sm font-medium',
                      'hover:bg-bone/10 transition-colors duration-200'
                    )}
                  >
                    View all in {category.name}
                    <Icon icon="lucide:arrow-right" className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
