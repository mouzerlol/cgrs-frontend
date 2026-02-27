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
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
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

const darkDotColorMap: Record<string, string> = {
  terracotta: 'bg-terracotta',
  sage: 'bg-sage-light',
  forest: 'bg-forest-light',
};

function MonthPage({
  monthName,
  monthIndex,
  year,
  isCurrent,
  isSelected,
  eventColors,
  onClick,
  dark = false,
}: {
  monthName: string;
  monthIndex: number;
  year: number;
  isCurrent: boolean;
  isSelected: boolean;
  eventColors: string[];
  onClick: () => void;
  dark?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        dark
          ? cn(
              'relative flex flex-col border border-bone/[0.12] rounded-[4px] bg-bone/[0.08] cursor-pointer transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-none overflow-hidden w-full aspect-[1.2/1] p-0 min-h-[40px] lg:aspect-auto lg:h-full',
              'hover:bg-bone/[0.15] hover:-translate-y-px hover:shadow-[0_2px_8px_rgba(0,0,0,0.15)]',
              isSelected && 'bg-bone/20 shadow-[inset_0_0_0_1px_theme(colors.terracotta),0_2px_8px_rgba(217,93,57,0.2)] -translate-y-px',
              isCurrent && !isSelected && 'shadow-[inset_0_0_0_1px_rgba(244,241,234,0.3)]'
            )
          : cn(
              'relative flex flex-col border-none rounded-[4px] bg-sage-light cursor-pointer transition-all duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[0_1px_2px_rgba(26,34,24,0.06),0_2px_0_theme(colors.sage-light)] overflow-hidden w-full aspect-[1.2/1] p-0 min-h-[40px] lg:aspect-auto lg:h-full',
              'before:content-[""] before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-forest-light before:border-b before:border-black/5 before:z-[1]',
              'hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(217,93,57,0.12),0_2px_0_theme(colors.terracotta)] hover:before:bg-terracotta',
              isSelected && 'bg-forest-light -translate-y-0.5 shadow-[0_4px_12px_rgba(26,34,24,0.25),0_2px_0_theme(colors.forest)] before:bg-forest',
              isCurrent && !isSelected && 'shadow-[0_2px_0_theme(colors.forest-light),0_4px_12px_rgba(26,34,24,0.1)] before:bg-forest-light'
            )
      )}
      aria-label={`View ${monthName} ${year}`}
    >
      <div className="pt-3 px-1 pb-0.5 text-center flex-shrink-0 z-[2]">
        <span
          className={cn(
            'font-display text-[0.6rem] font-bold uppercase tracking-[0.05em] leading-none',
            dark ? 'text-bone' : cn('text-forest', isSelected && 'text-bone')
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
                  'w-1 h-1 rounded-full flex-shrink-0 block',
                  dark ? darkDotColorMap[color] : monthDotColorMap[color]
                )}
              />
            ))}
          </div>
        ) : (
          <span className={cn('w-2.5 h-px opacity-30', dark ? 'bg-bone/15' : 'bg-sage-light')} />
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
  const months = useMemo(() => {
    const result: { name: string; date: Date; eventColors: string[] }[] = [];
    // Anchor navigation to the actual current date (Today)
    const today = new Date();
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
  }, [items]); // Removed currentMonth dependency so it stays anchored to "Today"

  return (
    <div className="flex-1 flex flex-col min-h-0 w-full">
      <div className="grid grid-cols-6 gap-2 flex-1 w-full content-start lg:flex lg:flex-row lg:items-stretch lg:justify-between lg:h-auto lg:overflow-y-hidden lg:overflow-x-auto lg:scrollbar-none">
        {months.map((month) => {
          const isSelected = month.date.getMonth() === currentMonth.getMonth() && 
                            month.date.getFullYear() === currentMonth.getFullYear();
          return (
            <MonthPage
              key={`${month.date.getFullYear()}-${month.date.getMonth()}`}
              monthName={month.name}
              monthIndex={month.date.getMonth()}
              year={month.date.getFullYear()}
              isCurrent={isSelected}
              isSelected={isSelected}
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
