'use client';

import { formatDateHeader, isTodayDate } from '@/lib/calendar-utils';
import { CalendarItemCard } from './CalendarItemCard';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@/types';

interface DateGroupProps {
  date: string;
  items: CalendarItem[];
  expandedItemId: string | null;
  onItemClick: (itemId: string) => void;
}

export function DateGroup({
  date,
  items,
  expandedItemId,
  onItemClick,
}: DateGroupProps) {
  const isToday = isTodayDate(date);

  return (
    <div className="date-group" data-date={date}>
      <h3
        className={cn(
          'date-group-header',
          isToday && 'date-group-header-today'
        )}
      >
        {formatDateHeader(date)}
        {isToday && <span className="date-group-today-badge">Today</span>}
      </h3>
      <div className="date-group-items">
        {items.map((item) => (
          <CalendarItemCard
            key={item.id}
            item={item}
            isExpanded={expandedItemId === item.id}
            onToggle={() => onItemClick(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default DateGroup;
