'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { DiscussionCategory } from '@/types';

interface CategoryCTAProps {
  category: DiscussionCategory;
  threadCount: number;
  className?: string;
}

/** Per-category tagline map. Short, smart, friendly (NZ / UK English). */
const CATEGORY_TAGLINES: Record<string, string> = {
  announcements: 'Be the first to know',
  parking: 'Space to share',
  'waste-management': "Let's get this sorted",
  'questions-help': 'Help is at hand',
  'neighborhood-watch': 'Eyes on the street',
  general: "What's on your mind?",
  events: "What's on locally",
  introductions: 'Hello, neighbour',
};

const DEFAULT_TAGLINE = 'Your community awaits';

/**
 * Call-to-action banner shown below the thread list when a category is selected.
 * Entire card is a single link with hover affordance; ghost control mirrors the action.
 */
export function CategoryCTA({ category, threadCount, className }: CategoryCTAProps) {
  const tagline = CATEGORY_TAGLINES[category.slug] ?? DEFAULT_TAGLINE;
  const href = `/discussion/new?category=${category.slug}`;
  const eyebrow = threadCount > 0 ? 'Continue the conversation' : 'Start the conversation';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(className)}
    >
      <Link
        href={href}
        aria-label={`${eyebrow}: ${tagline}. Create a new thread in ${category.name}.`}
        className={cn(
          'group relative block overflow-hidden rounded-xl border border-sage',
          'bg-gradient-to-br from-sage-light via-white to-sage-light',
          'transition-all duration-200 ease-out',
          'hover:border-forest/30 hover:shadow-[0_10px_28px_rgba(26,34,24,0.1)]',
          'hover:-translate-y-0.5',
          'active:translate-y-0 active:shadow-md',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bone',
        )}
      >
        {/* Decorative background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 8px,
              #1a2218 8px,
              #1a2218 9px
            )`,
          }}
        />

        {/* Left terracotta accent bar */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-1.5 bg-terracotta rounded-l-xl" />

        {/* Content row: matches ThreadCardCompact (rounded-xl, p-3, min height ~compact row) */}
        <div
          className={cn(
            'relative flex min-h-[108px] flex-col gap-3 pl-[calc(0.75rem+0.375rem)] pr-3 py-3 sm:flex-row sm:items-center',
          )}
        >
          <div className="flex min-w-0 flex-1 gap-2">
            {/* Icon column: eyebrow + tagline share the text column so both lines align */}
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center self-start rounded-lg bg-terracotta/10">
              <Icon icon="lucide:pencil" className="h-3.5 w-3.5 text-terracotta" />
            </span>
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium uppercase tracking-widest text-forest/50">
                {eyebrow}
              </span>
              <p className="mt-1.5 font-display text-lg font-semibold leading-snug text-forest/65">{tagline}</p>
            </div>
          </div>

          {/* Ghost control (visual only; whole card is the link) */}
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-2 self-start px-4 py-2.5 sm:self-center',
              'rounded-xl border border-forest/20 bg-transparent text-sm font-medium text-forest',
              'transition-colors duration-200',
              'group-hover:border-forest/45 group-hover:bg-white/60',
            )}
            aria-hidden
          >
            <Icon icon="lucide:plus" className="h-4 w-4" />
            New Thread
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

export default CategoryCTA;
