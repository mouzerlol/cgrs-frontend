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

const dotColorMap: Record<string, string> = {
  terracotta: 'bg-terracotta',
  sage: 'bg-sage',
  forest: 'bg-forest',
};

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
        'relative p-1 md:p-1.5 aspect-square lg:aspect-auto rounded-md border border-sage bg-white transition-all duration-[200ms] ease-out-custom flex flex-col items-center justify-start gap-1',
        !isInMonth && 'opacity-35 pointer-events-none',
        isToday && 'border-2 border-terracotta bg-terracotta/5',
        isSelected && 'border-2 border-sage bg-sage/15',
        items.length > 0 && isInMonth && 'cursor-pointer hover:border-forest hover:shadow-[0_4px_12px_rgba(26,34,24,0.1)] focus:outline-none focus:shadow-[0_0_0_2px_theme(colors.terracotta)]'
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
          'font-body text-xs md:text-[13px] font-medium text-forest leading-none',
          isToday && 'text-terracotta font-semibold'
        )}
      >
        {dayNumber}
      </span>

      {isInMonth && itemTypes.length > 0 && (
        <div className="flex gap-0.5 justify-center flex-wrap max-w-full w-full">
          {itemTypes.map((type) => (
            <span
              key={type}
              className={cn(
                'flex-1 min-w-0 h-2.5 md:h-3 rounded-[3px] md:rounded flex-shrink-0',
                dotColorMap[getTypeColor(type)]
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
