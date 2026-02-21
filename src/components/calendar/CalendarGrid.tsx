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
    <div className="calendar-grid">
      <div className="calendar-grid-header">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="calendar-weekday">
            {label}
          </div>
        ))}
      </div>
      <div 
        className="calendar-grid-body"
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
