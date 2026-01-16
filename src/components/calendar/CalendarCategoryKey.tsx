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
      'calendar-category-key',
      variant === 'compact' && 'calendar-category-key-compact',
      className
    )}>
      <div className="key-header">
        <span className="key-title">Event Types</span>
      </div>
      <div className="key-items">
        {categories.map((cat) => (
          <div key={cat.label} className="key-item">
            <span className={cn('key-dot', `bg-${cat.color}`)} />
            <span className="key-label">{cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalendarCategoryKey;
