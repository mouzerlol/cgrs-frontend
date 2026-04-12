'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

interface BookmarkButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether the thread is bookmarked */
  isBookmarked?: boolean;
  /** Callback when bookmark is toggled */
  onBookmark?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show label text */
  showLabel?: boolean;
}

/**
 * Bookmark/save button for threads.
 * Optimistic updates are handled by the React Query mutation hook.
 * The button is a pure display component that calls onBookmark immediately on click.
 * Minimum 44px touch target for mobile accessibility.
 */
const BookmarkButton = forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  (
    {
      isBookmarked = false,
      onBookmark,
      size = 'md',
      showLabel = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (disabled) return;

      onBookmark?.();
    };

    const sizeClasses = {
      sm: {
        button: 'min-w-[36px] min-h-[36px] p-1.5',
        icon: 'w-4 h-4',
        text: 'text-xs',
      },
      md: {
        button: 'min-w-[44px] min-h-[44px] p-2',
        icon: 'w-5 h-5',
        text: 'text-sm',
      },
    };

    const sizes = sizeClasses[size];

    return (
      <Tooltip content={isBookmarked ? 'Saved' : 'Save'}>
        <button
          ref={ref}
          type="button"
          onClick={handleBookmarkClick}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-200',
            sizes.button,
            isBookmarked
              ? 'bg-forest text-bone border-forest'
              : 'bg-transparent text-forest/60 border-sage hover:bg-sage-light hover:text-forest hover:border-forest/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark thread'}
          aria-pressed={isBookmarked}
          {...props}
        >
          {isBookmarked ? (
            <BookmarkCheck
              className={cn(sizes.icon, 'shrink-0 transition-transform duration-200 fill-current')}
              aria-hidden
            />
          ) : (
            <Bookmark className={cn(sizes.icon, 'shrink-0 transition-transform duration-200')} aria-hidden />
          )}
          {showLabel && (
            <span className={cn('font-medium', sizes.text)}>{isBookmarked ? 'Saved' : 'Save'}</span>
          )}
        </button>
      </Tooltip>
    );
  },
);

BookmarkButton.displayName = 'BookmarkButton';

export default BookmarkButton;
