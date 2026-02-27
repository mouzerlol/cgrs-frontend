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
    <div className={cn('flex items-center justify-between mb-sm px-xs w-full pb-xs', className)}>
      <button
        onClick={onPrevMonth}
        className="flex items-center justify-center w-8 h-8 border border-sage rounded-lg bg-transparent text-forest cursor-pointer transition-all duration-[200ms] ease-out-custom hover:bg-sage-light hover:border-forest focus:outline-none focus:shadow-[0_0_0_2px_theme(colors.terracotta)]"
        aria-label="Previous month"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <h2 className="font-display text-[1.1rem] font-medium text-forest">
        {formatMonthYear(currentMonth)}
      </h2>
      <button
        onClick={onNextMonth}
        className="flex items-center justify-center w-8 h-8 border border-sage rounded-lg bg-transparent text-forest cursor-pointer transition-all duration-[200ms] ease-out-custom hover:bg-sage-light hover:border-forest focus:outline-none focus:shadow-[0_0_0_2px_theme(colors.terracotta)]"
        aria-label="Next month"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}

export default MonthNavigationBar;
