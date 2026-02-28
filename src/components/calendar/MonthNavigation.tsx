'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@/types';
import { getTypeColor } from '@/lib/calendar-config';

interface MonthNavigationProps {
  currentMonth: Date;
  items: CalendarItem[];
  onMonthSelect: (month: Date) => void;
  variant?: 'light' | 'dark';
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getMonthEventColors(items: CalendarItem[], year: number, monthIndex: number): string[] {
  const colors: string[] = [];
  const targetMonth = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  
  for (const item of items) {
    if (item.date.startsWith(targetMonth)) {
      colors.push(getTypeColor(item.type));
    }
  }
  
  return colors;
}

const monthDotColorMap: Record<string, string> = {
  terracotta: 'bg-terracotta',
  sage: 'bg-sage',
  forest: 'bg-forest-light',
};

/** Dots for non-active buttons on dark header – lighter tints for visibility. */
const inactiveDarkDotColorMap: Record<string, string> = {
  terracotta: 'bg-terracotta',
  sage: 'bg-sage-lite',
  forest: 'bg-forest-light',
};

/** Dots for active (sage-light) button – darker tones for contrast on light bg. */
const activeDotColorMap: Record<string, string> = {
  terracotta: 'bg-terracotta',
  sage: 'bg-sage',
  forest: 'bg-forest',
};

function MonthPage({
  monthName,
  monthIndex,
  year,
  isCurrent,
  isSelected,
  isTodayMonth,
  eventColors,
  onClick,
  dark = false,
}: {
  monthName: string;
  monthIndex: number;
  year: number;
  isCurrent: boolean;
  isSelected: boolean;
  isTodayMonth: boolean;
  eventColors: string[];
  onClick: () => void;
  dark?: boolean;
}) {
  const isActive = isSelected;
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col rounded-[6px] cursor-pointer transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden w-full aspect-[1.2/1] p-0 min-h-[40px] lg:aspect-auto lg:h-full',
        dark
          ? cn(
              'border border-sage/30',
              !isActive &&
                'bg-bone/20 text-forest hover:bg-bone/35 hover:border-sage/50 hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(26,34,24,0.12)]',
              isActive && 'bg-sage-light border-forest text-forest shadow-[0_2px_8px_rgba(26,34,24,0.2)] -translate-y-px',
              isTodayMonth && !isActive && 'ring-1 ring-sage/40 ring-inset'
            )
          : cn(
              'border border-sage/40',
              !isActive &&
                'bg-sage-light/60 text-forest/80 hover:bg-sage-light/80 hover:border-sage hover:text-forest',
              isActive && 'bg-sage-light border-forest text-forest shadow-[0_2px_8px_rgba(26,34,24,0.15)] -translate-y-px',
              isTodayMonth && !isActive && 'border-sage'
            )
      )}
      aria-label={`View ${monthName} ${year}`}
      aria-current={isActive ? 'true' : undefined}
    >
      {isTodayMonth && !isActive && (
        <span className="absolute top-1 right-1.5 w-1 h-1 rounded-full bg-forest-light z-[2]" aria-hidden />
      )}
      <div className="pt-3 px-1 pb-0.5 text-center flex-shrink-0 z-[2]">
        <span
          className={cn(
            'font-display text-xs font-bold uppercase tracking-[0.05em] leading-none',
            dark ? (isActive ? 'text-forest' : 'text-white') : (isActive ? 'text-forest' : 'text-forest/80')
          )}
        >
          {monthName}
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center p-1 overflow-hidden min-h-[20px]">
        {eventColors.length > 0 ? (
          <div className="flex gap-0.5 flex-wrap justify-center content-center max-w-full">
            {eventColors.map((color, i) => (
              <span
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0 block',
                  isActive ? activeDotColorMap[color] : dark ? inactiveDarkDotColorMap[color] : monthDotColorMap[color]
                )}
              />
            ))}
          </div>
        ) : (
          <span
            className={cn(
              'w-2.5 h-px opacity-40',
              isActive ? 'bg-forest/30' : dark ? 'bg-sage/40' : 'bg-sage'
            )}
          />
        )}
      </div>
    </button>
  );
}

export function MonthNavigation({
  currentMonth,
  items,
  onMonthSelect,
  variant = 'dark',
}: MonthNavigationProps) {
  const isDark = variant === 'dark';
  const today = useMemo(() => new Date(), []);
  const months = useMemo(() => {
    const result: { name: string; date: Date; eventColors: string[] }[] = [];
    const startYear = today.getFullYear();
    const startMonth = today.getMonth();

    for (let i = 0; i < 6; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      const mIndex = date.getMonth();
      const year = date.getFullYear();
      const eventColors = getMonthEventColors(items, year, mIndex);
      result.push({ name: MONTHS[mIndex], date, eventColors });
    }

    return result;
  }, [items, today]);

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="grid grid-cols-6 gap-2 flex-1 w-full content-start lg:flex lg:flex-row lg:items-stretch lg:justify-between lg:h-auto lg:overflow-y-hidden lg:overflow-x-auto lg:scrollbar-none">
        {months.map((month) => {
          const isSelected =
            month.date.getMonth() === currentMonth.getMonth() &&
            month.date.getFullYear() === currentMonth.getFullYear();
          const isTodayMonth =
            month.date.getMonth() === today.getMonth() && month.date.getFullYear() === today.getFullYear();
          return (
            <MonthPage
              key={`${month.date.getFullYear()}-${month.date.getMonth()}`}
              monthName={month.name}
              monthIndex={month.date.getMonth()}
              year={month.date.getFullYear()}
              isCurrent={isSelected}
              isSelected={isSelected}
              isTodayMonth={isTodayMonth}
              eventColors={month.eventColors}
              onClick={() => onMonthSelect(month.date)}
              dark={isDark}
            />
          );
        })}
      </div>
    </div>
  );
}

export default MonthNavigation;
