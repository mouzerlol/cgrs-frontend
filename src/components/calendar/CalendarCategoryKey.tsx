'use client';

import { cn } from '@/lib/utils';

interface CalendarCategoryKeyProps {
  className?: string;
  variant?: 'default' | 'compact';
}

/**
 * A modular key for calendar categories following the design system.
 * Uses Forest background and Bone text for high contrast and brand consistency.
 */
export function CalendarCategoryKey({ className, variant = 'default' }: CalendarCategoryKeyProps) {
  const categories = [
    { label: 'Notices', color: 'terracotta' },
    { label: 'Events', color: 'sage' },
    { label: 'News', color: 'forest' },
  ];

  return (
    <div className={cn(
      'bg-forest-light text-bone flex flex-col gap-xs shrink-0 z-10',
      variant === 'compact'
        ? 'px-sm py-1.5 flex-row items-center gap-md'
        : 'px-md py-sm',
      className
    )}>
      {variant !== 'compact' && (
        <div className="pb-1">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-bone opacity-90">Event Types</span>
        </div>
      )}
      {variant === 'compact' && (
        <div className="border-r border-bone/20 pr-sm">
          <span className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-bone opacity-90">Event Types</span>
        </div>
      )}
      <div className="flex gap-md items-center">
        {categories.map((cat) => (
          <div key={cat.label} className="flex items-center gap-1.5">
            <span className={cn('w-2 h-2 rounded-full shrink-0 border border-bone/30', `bg-${cat.color}`)} />
            <span className="font-body text-[0.7rem] font-medium text-bone">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarCategoryKey;
