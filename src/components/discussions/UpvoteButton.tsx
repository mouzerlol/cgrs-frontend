'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

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
 * Optimistic updates are handled by the React Query mutation hook.
 * The button is a pure display component that calls onUpvote immediately on click.
 * Minimum 44px touch target for mobile accessibility.
 */
const UpvoteButton = forwardRef<HTMLButtonElement, UpvoteButtonProps>(
  (
    {
      count,
      isUpvoted = false,
      onUpvote,
      size = 'md',
      direction = 'vertical',
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handleUpvoteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      if (disabled) return;

      onUpvote?.();
    };

    const sizeClasses = {
      sm: {
        button:
          direction === 'vertical'
            ? 'min-w-[40px] min-h-[44px] p-1'
            : /* horizontal: slightly shorter than sibling text actions for visual balance */
              'h-6 min-h-[24px] px-1.5 py-0',
        icon: direction === 'vertical' ? 'w-4 h-4' : 'w-3 h-3',
        text: direction === 'vertical' ? 'text-xs' : 'text-[11px]',
        gap: direction === 'vertical' ? 'gap-0.5' : 'gap-0.5',
      },
      md: {
        button:
          direction === 'vertical'
            ? 'min-w-[48px] min-h-[48px] p-1.5'
            : 'h-9 min-h-[36px] px-2 py-1',
        icon: direction === 'vertical' ? 'w-5 h-5' : 'w-4 h-4',
        text: direction === 'vertical' ? 'text-sm' : 'text-xs',
        gap: direction === 'vertical' ? 'gap-0.5' : 'gap-1',
      },
    };

    const sizes = sizeClasses[size];
    const isCompactHorizontal = size === 'sm' && direction === 'horizontal';
    const isHorizontal = direction === 'horizontal';

    return (
      <Tooltip content={isUpvoted ? 'Remove upvote' : 'Upvote'}>
        <button
          ref={ref}
          type="button"
          onClick={handleUpvoteClick}
          disabled={disabled}
          className={cn(
            'flex items-center justify-center border transition-all duration-200',
            isHorizontal ? 'rounded-md' : 'rounded-lg',
            direction === 'vertical' ? 'flex-col' : 'flex-row',
            sizes.button,
            sizes.gap,
            isUpvoted
              ? 'bg-terracotta text-bone border-terracotta hover:bg-terracotta-dark'
              : isCompactHorizontal
                ? 'bg-sage-light/80 text-forest border-forest/10 hover:bg-sage/90 hover:border-forest/18'
                : 'bg-sage-light text-forest border-sage hover:bg-sage hover:border-forest/20',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          )}
          aria-label={isUpvoted ? 'Remove upvote' : 'Upvote'}
          aria-pressed={isUpvoted}
          {...props}
        >
          <Icon
            icon={isUpvoted ? 'lucide:arrow-big-up-dash' : 'lucide:arrow-big-up'}
            className={cn(sizes.icon, 'transition-transform duration-200')}
          />
          <span className={cn('font-semibold tabular-nums', sizes.text)}>{count}</span>
        </button>
      </Tooltip>
    );
  },
);

UpvoteButton.displayName = 'UpvoteButton';

export default UpvoteButton;
