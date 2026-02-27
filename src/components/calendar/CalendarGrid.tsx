'use client';

import { DateCell } from './DateCell';
import {
  generateCalendarDays,
  formatDateKey,
} from '@/lib/calendar-utils';
import { WEEKDAY_LABELS } from '@/lib/calendar-config';
import type { CalendarItem } from '@/types';

interface CalendarGridProps {
  currentMonth: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  selectedDate: string | null;
  onDateClick: (dateString: string) => void;
}

export function CalendarGrid({
  currentMonth,
  itemsByDate,
  selectedDate,
  onDateClick,
}: CalendarGridProps) {
  const days = generateCalendarDays(currentMonth);
  const numRows = Math.ceil(days.length / 7);

  return (
    <div className="w-full flex flex-col flex-1 [container-type:inline-size]">
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-center font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.05em] text-forest/60 py-1"
          >
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-7 gap-0.5 flex-1 [grid-auto-rows:1fr]"
        style={{ '--num-rows': numRows } as React.CSSProperties}
      >
        {days.map((date) => {
          const dateKey = formatDateKey(date);
          const items = itemsByDate.get(dateKey) || [];

          return (
            <DateCell
              key={dateKey}
              date={date}
              currentMonth={currentMonth}
              items={items}
              isSelected={selectedDate === dateKey}
              onDateClick={onDateClick}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CalendarGrid;
