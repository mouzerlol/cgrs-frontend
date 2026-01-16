'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

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
 * Allows users to save threads for later reference.
 * Minimum 44px touch target for mobile accessibility.
 */
const BookmarkButton = forwardRef<HTMLButtonElement, BookmarkButtonProps>(
  ({
    isBookmarked = false,
    onBookmark,
    size = 'md',
    showLabel = false,
    className,
    disabled,
    ...props
  }, ref) => {
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
      <button
        ref={ref}
        type="button"
        onClick={onBookmark}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-lg border transition-all duration-200',
          sizes.button,
          isBookmarked
            ? 'bg-forest text-bone border-forest'
            : 'bg-transparent text-forest/60 border-sage hover:bg-sage-light hover:text-forest hover:border-forest/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark thread'}
        aria-pressed={isBookmarked}
        {...props}
      >
        <Icon
          icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark'}
          className={cn(
            sizes.icon,
            'transition-transform duration-200',
            isBookmarked && 'fill-current'
          )}
        />
        {showLabel && (
          <span className={cn('font-medium', sizes.text)}>
            {isBookmarked ? 'Saved' : 'Save'}
          </span>
        )}
      </button>
    );
  }
);

BookmarkButton.displayName = 'BookmarkButton';

export default BookmarkButton;
