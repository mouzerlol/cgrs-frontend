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
            'bg-white rounded-xl border border-sage/30',
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

    // Card variant
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border border-sage/30',
          'animate-pulse',
          className
        )}
        {...props}
      >
        <div className="flex">
          {/* Upvote column skeleton */}
          <div className="flex-shrink-0 p-4">
            <div className="w-12 h-16 bg-sage-light rounded-lg" />
          </div>

          {/* Main content skeleton */}
          <div className="flex-1 py-4 pr-4">
            {/* Header skeleton */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-16 h-5 bg-sage-light rounded" />
              <div className="w-12 h-5 bg-sage-light rounded" />
            </div>

            {/* Title skeleton */}
            <div className="h-6 w-3/4 bg-sage-light rounded mb-3" />

            {/* Body skeleton */}
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full bg-sage-light rounded" />
              <div className="h-4 w-2/3 bg-sage-light rounded" />
            </div>

            {/* Footer skeleton */}
            <div className="flex items-center justify-between pt-3 border-t border-sage/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-sage-light rounded-full" />
                <div className="w-24 h-4 bg-sage-light rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-4 bg-sage-light rounded" />
                <div className="w-8 h-4 bg-sage-light rounded" />
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
