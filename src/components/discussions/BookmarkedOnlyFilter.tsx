'use client';

import { forwardRef } from 'react';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookmarkedOnlyFilterProps {
  /** Whether the bookmark-only filter is active. */
  pressed: boolean;
  /** Called when the user toggles the filter. */
  onPressedChange: (next: boolean) => void;
  /** When true, the control is disabled (e.g. signed out). */
  disabled?: boolean;
  /** Explains why the control is disabled (e.g. for tooltips). */
  disabledReason?: string;
  className?: string;
}

/**
 * Toggle to show only threads the current user has bookmarked.
 * Sits beside sort controls; uses aria-pressed for accessibility.
 */
const BookmarkedOnlyFilter = forwardRef<HTMLButtonElement, BookmarkedOnlyFilterProps>(
  ({ pressed, onPressedChange, disabled, disabledReason, className }, ref) => {
    const reason = disabledReason ?? 'Sign in to filter by bookmarks';

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={pressed}
        aria-disabled={disabled}
        disabled={disabled}
        title={disabled ? reason : pressed ? 'Show all threads' : 'Show only bookmarked threads'}
        aria-label={disabled ? reason : pressed ? 'Show all threads' : 'Show only bookmarked threads'}
        onClick={() => {
          if (!disabled) onPressedChange(!pressed);
        }}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5',
          'rounded-xl border text-sm text-forest',
          'transition-all duration-200',
          'focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10',
          disabled && 'opacity-50 cursor-not-allowed',
          pressed
            ? 'bg-terracotta/10 border-terracotta/40 text-terracotta font-medium'
            : 'bg-white border-sage/30 hover:border-sage',
          className
        )}
      >
        <Bookmark className="size-4 shrink-0" aria-hidden />
        <span className="font-medium">Bookmarked</span>
      </button>
    );
  }
);

BookmarkedOnlyFilter.displayName = 'BookmarkedOnlyFilter';

export default BookmarkedOnlyFilter;
