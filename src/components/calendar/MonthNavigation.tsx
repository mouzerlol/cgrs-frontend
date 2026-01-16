'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { CalendarItem } from '@/types';
import { getTypeColor } from '@/lib/calendar-config';

interface MonthNavigationProps {
  currentMonth: Date;
  items: CalendarItem[];
  onMonthSelect: (month: Date) => void;
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

function MonthPage({
  monthName,
  monthIndex,
  year,
  isCurrent,
  isSelected,
  eventColors,
  onClick,
}: {
  monthName: string;
  monthIndex: number;
  year: number;
  isCurrent: boolean;
  isSelected: boolean;
  eventColors: string[];
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'month-page',
        isSelected && 'month-page-selected',
        isCurrent && !isSelected && 'month-page-current'
      )}
      aria-label={`View ${monthName} ${year}`}
    >
      <div className="month-page-header">
        <span className="month-page-label">{monthName}</span>
      </div>
      <div className="month-page-body">
        {eventColors.length > 0 ? (
          <div className="month-page-dots">
            {eventColors.map((color, i) => (
              <span
                key={i}
                className={cn('month-page-dot', `month-dot-${color}`)}
              />
            ))}
          </div>
        ) : (
          <span className="month-page-empty" />
        )}
      </div>
    </button>
  );
}

export function MonthNavigation({
  currentMonth,
  items,
  onMonthSelect,
}: MonthNavigationProps) {
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
    <div className="year-overview-nav">
      <div className="month-pages-grid">
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
            />
          );
        })}
      </div>
    </div>
  );
}

export default MonthNavigation;
