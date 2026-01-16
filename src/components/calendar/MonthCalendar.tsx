'use client';

import { MonthNavigationBar } from './MonthNavigationBar';
import { CalendarGrid } from './CalendarGrid';
import type { CalendarItem } from '@/types';

interface MonthCalendarProps {
  currentMonth: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  selectedDate: string | null;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (dateString: string) => void;
}

export function MonthCalendar({
  currentMonth,
  itemsByDate,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onDateClick,
}: MonthCalendarProps) {
  return (
    <div className="month-calendar">
      <MonthNavigationBar
        currentMonth={currentMonth}
        onPrevMonth={onPrevMonth}
        onNextMonth={onNextMonth}
      />
      <CalendarGrid
        currentMonth={currentMonth}
        itemsByDate={itemsByDate}
        selectedDate={selectedDate}
        onDateClick={onDateClick}
      />
    </div>
  );
}

export default MonthCalendar;
