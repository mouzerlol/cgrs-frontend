'use client';

import { forwardRef, HTMLAttributes } from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';

type ViewMode = 'card' | 'compact';

interface ViewToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Current view mode */
  value: ViewMode;
  /** Callback when view mode changes */
  onChange: (value: ViewMode) => void;
}

/**
 * Toggle between card view and compact list view.
 * Selecting the inactive option switches to it; clicking the active option switches to the other (two-way toggle).
 */
const ViewToggle = forwardRef<HTMLDivElement, ViewToggleProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const handleCardClick = () => {
      onChange(value === 'card' ? 'compact' : 'card');
    };

    const handleCompactClick = () => {
      onChange(value === 'compact' ? 'card' : 'compact');
    };

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
        <Tooltip content="Card view">
          <button
            type="button"
            onClick={handleCardClick}
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
            <LayoutGrid className="w-5 h-5" aria-hidden />
          </button>
        </Tooltip>

        <Tooltip content="Compact view">
          <button
            type="button"
            onClick={handleCompactClick}
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
            <List className="w-5 h-5" aria-hidden />
          </button>
        </Tooltip>
      </div>
    );
  }
);

ViewToggle.displayName = 'ViewToggle';

export default ViewToggle;
