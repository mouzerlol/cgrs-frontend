'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ThreadCardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Which variant to display */
  variant?: 'card' | 'compact';
}

/**
 * Skeleton loader for thread cards.
 * Matches the structure of ThreadCard and ThreadCardCompact.
 */
const ThreadCardSkeleton = forwardRef<HTMLDivElement, ThreadCardSkeletonProps>(
  ({ variant = 'card', className, ...props }, ref) => {
    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-3 px-4 py-3',
            'bg-white rounded-xl border border-sage',
            'animate-pulse',
            className
          )}
          {...props}
        >
          {/* Title skeleton */}
          <div className="flex-1 h-5 bg-sage-light rounded" />

          {/* Category skeleton */}
          <div className="w-16 h-5 bg-sage-light rounded hidden sm:block" />

          {/* Stats skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-5 bg-sage-light rounded" />
            <div className="w-10 h-5 bg-sage-light rounded" />
            <div className="w-8 h-5 bg-sage-light rounded" />
          </div>
        </div>
      );
    }

    // Card variant — reserved left column + top author row + footer actions
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-full min-h-0 flex-col rounded-2xl border border-sage bg-white',
          'animate-pulse',
          className
        )}
        {...props}
      >
        <div className="flex min-h-0 flex-1 items-stretch">
          <div className="w-32 shrink-0 self-stretch min-h-[5.5rem] bg-sage-light md:w-40">
            <div className="h-full min-h-[5.5rem] w-full bg-sage/30" />
          </div>

          <div className="flex min-h-0 min-w-0 flex-1 flex-col px-3 py-3 md:px-4 md:py-4">
            <div className="mb-0 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="h-5 w-4/5 rounded bg-sage-light md:h-6" />
                  <div className="h-5 w-3/5 rounded bg-sage-light md:h-6" />
                </div>
              </div>
              <div className="h-9 w-9 shrink-0 rounded-full bg-sage-light" />
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              <div className="h-4 w-24 rounded bg-sage-light" />
              <div className="h-4 w-12 rounded bg-sage-light" />
            </div>

            <div className="mb-1.5 min-h-10 space-y-2">
              <div className="h-4 w-full rounded bg-sage-light" />
              <div className="h-4 w-2/3 rounded bg-sage-light" />
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-sage/20 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-9 w-16 rounded-lg bg-sage-light" />
                <div className="h-5 w-8 rounded bg-sage-light" />
              </div>
              <div className="flex gap-1">
                <div className="h-8 w-8 rounded-lg bg-sage-light" />
                <div className="h-8 w-8 rounded-lg bg-sage-light" />
                <div className="h-8 w-8 rounded-lg bg-sage-light" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ThreadCardSkeleton.displayName = 'ThreadCardSkeleton';

export default ThreadCardSkeleton;
