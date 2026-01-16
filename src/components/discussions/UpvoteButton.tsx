'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface UpvoteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Current upvote count */
  count: number;
  /** Whether the current user has upvoted */
  isUpvoted?: boolean;
  /** Callback when upvote is toggled */
  onUpvote?: () => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Layout direction */
  direction?: 'vertical' | 'horizontal';
}

/**
 * Upvote button with count display.
 * Community-friendly: only upvotes, no downvotes.
 * Minimum 44px touch target for mobile accessibility.
 */
const UpvoteButton = forwardRef<HTMLButtonElement, UpvoteButtonProps>(
  ({
    count,
    isUpvoted = false,
    onUpvote,
    size = 'md',
    direction = 'vertical',
    className,
    disabled,
    ...props
  }, ref) => {
    const sizeClasses = {
      sm: {
        button: direction === 'vertical' ? 'min-w-[40px] min-h-[44px] p-1' : 'min-h-[36px] px-2 py-1',
        icon: 'w-4 h-4',
        text: 'text-xs',
        gap: direction === 'vertical' ? 'gap-0.5' : 'gap-1',
      },
      md: {
        button: direction === 'vertical' ? 'min-w-[48px] min-h-[48px] p-1.5' : 'min-h-[44px] px-3 py-1.5',
        icon: 'w-5 h-5',
        text: 'text-sm',
        gap: direction === 'vertical' ? 'gap-0.5' : 'gap-1.5',
      },
    };

    const sizes = sizeClasses[size];

    return (
      <button
        ref={ref}
        type="button"
        onClick={onUpvote}
        disabled={disabled}
        className={cn(
          'flex items-center justify-center rounded-lg border transition-all duration-200',
          direction === 'vertical' ? 'flex-col' : 'flex-row',
          sizes.button,
          sizes.gap,
          isUpvoted
            ? 'bg-terracotta text-bone border-terracotta hover:bg-terracotta-dark'
            : 'bg-sage-light text-forest border-sage hover:bg-sage hover:border-forest/20',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
        aria-pressed={isUpvoted}
        {...props}
      >
        <Icon
          icon={isUpvoted ? 'lucide:arrow-big-up-dash' : 'lucide:arrow-big-up'}
          className={cn(
            sizes.icon,
            'transition-transform duration-200',
            !disabled && 'group-hover:scale-110'
          )}
        />
        <span className={cn('font-semibold tabular-nums', sizes.text)}>
          {count}
        </span>
      </button>
    );
  }
);

UpvoteButton.displayName = 'UpvoteButton';

export default UpvoteButton;
