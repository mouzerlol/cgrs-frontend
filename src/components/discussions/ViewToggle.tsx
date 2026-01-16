'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

type ViewMode = 'card' | 'compact';

interface ViewToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (value: ViewMode) => void;
}

/**
 * Toggle between card view and compact list view.
 * Allows users to choose their preferred thread display.
 */
const ViewToggle = forwardRef<HTMLDivElement, ViewToggleProps>(
  ({ value, onChange, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 p-1',
          'bg-sage-light rounded-lg',
          className
        )}
        role="radiogroup"
        aria-label="View mode"
        {...props}
      >
        <button
          type="button"
          onClick={() => onChange('card')}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            'transition-all duration-200',
            value === 'card'
              ? 'bg-white text-forest shadow-sm'
              : 'text-forest/50 hover:text-forest'
          )}
          role="radio"
          aria-checked={value === 'card'}
          aria-label="Card view"
        >
          <Icon icon="lucide:layout-grid" className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={() => onChange('compact')}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-lg',
            'transition-all duration-200',
            value === 'compact'
              ? 'bg-white text-forest shadow-sm'
              : 'text-forest/50 hover:text-forest'
          )}
          role="radio"
          aria-checked={value === 'compact'}
          aria-label="Compact view"
        >
          <Icon icon="lucide:list" className="w-5 h-5" />
        </button>
      </div>
    );
  }
);

ViewToggle.displayName = 'ViewToggle';

export default ViewToggle;
