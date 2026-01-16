'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatMonthYear } from '@/lib/calendar-utils';
import { cn } from '@/lib/utils';

interface MonthNavigationBarProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  className?: string;
}

export function MonthNavigationBar({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  className,
}: MonthNavigationBarProps) {
  return (
    <div className={cn('month-navigation', className)}>
      <button
        onClick={onPrevMonth}
        className="month-nav-button"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="month-nav-title">{formatMonthYear(currentMonth)}</h2>
      <button
        onClick={onNextMonth}
        className="month-nav-button"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default MonthNavigationBar;
