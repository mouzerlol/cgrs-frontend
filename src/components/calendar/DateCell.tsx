'use client';

import { cn } from '@/lib/utils';
import {
  formatDayNumber,
  formatDateKey,
  checkIsToday,
  isCurrentMonth,
} from '@/lib/calendar-utils';
import { getTypeColor } from '@/lib/calendar-config';
import type { CalendarItem } from '@/types';

interface DateCellProps {
  date: Date;
  currentMonth: Date;
  items: CalendarItem[];
  isSelected: boolean;
  onDateClick: (dateString: string) => void;
}

export function DateCell({
  date,
  currentMonth,
  items,
  isSelected,
  onDateClick,
}: DateCellProps) {
  const dateKey = formatDateKey(date);
  const dayNumber = formatDayNumber(date);
  const isToday = checkIsToday(date);
  const isInMonth = isCurrentMonth(date, currentMonth);

  const handleClick = () => {
    if (isInMonth && items.length > 0) {
      onDateClick(dateKey);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && isInMonth && items.length > 0) {
      e.preventDefault();
      onDateClick(dateKey);
    }
  };

  // Group items by type to show one dot per type
  const itemTypes = Array.from(new Set(items.map(item => item.type)));

  return (
    <div
      className={cn(
        'date-cell-compact',
        !isInMonth && 'date-cell-other-month',
        isToday && 'date-cell-today',
        isSelected && 'date-cell-selected',
        items.length > 0 && isInMonth && 'date-cell-has-items'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={isInMonth && items.length > 0 ? 0 : -1}
      role="button"
      aria-label={`${dayNumber}, ${items.length} items`}
      aria-pressed={isSelected}
    >
      <span
        className={cn(
          'date-cell-number',
          isToday && 'date-cell-number-today'
        )}
      >
        {dayNumber}
      </span>

      {isInMonth && itemTypes.length > 0 && (
        <div className="date-cell-dots">
          {itemTypes.map((type) => (
            <span
              key={type}
              className={cn(
                'item-dot',
                `item-dot-${getTypeColor(type)}`
              )}
              title={`${items.filter(i => i.type === type).length} ${type}(s)`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default DateCell;
