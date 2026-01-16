'use client';

import { MonthCalendar } from './MonthCalendar';
import { CalendarDetailView } from './CalendarDetailView';
import { MonthNavigation } from './MonthNavigation';
import { CalendarCategoryKey } from './CalendarCategoryKey';
import type { CalendarItem, DateGrouping } from '@/types';
import { RefObject } from 'react';

interface CalendarViewContainerProps {
  currentMonth: Date;
  itemsByDate: Map<string, CalendarItem[]>;
  groupedItems: DateGrouping[];
  selectedDate: string | null;
  expandedItemId: string | null;
  detailViewRef: RefObject<HTMLDivElement | null>;
  items: CalendarItem[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDateClick: (dateString: string) => void;
  onItemClick: (itemId: string) => void;
  onMonthSelect: (month: Date) => void;
}

export function CalendarViewContainer({
  currentMonth,
  itemsByDate,
  groupedItems,
  selectedDate,
  expandedItemId,
  detailViewRef,
  items,
  onPrevMonth,
  onNextMonth,
  onDateClick,
  onItemClick,
  onMonthSelect,
}: CalendarViewContainerProps) {
  return (
    <div className="calendar-view-container">
      <div className="calendar-grid-column">
        <MonthCalendar
          currentMonth={currentMonth}
          itemsByDate={itemsByDate}
          selectedDate={selectedDate}
          onPrevMonth={onPrevMonth}
          onNextMonth={onNextMonth}
          onDateClick={onDateClick}
        />
        <MonthNavigation
          currentMonth={currentMonth}
          items={items}
          onMonthSelect={onMonthSelect}
        />
      </div>
      <div className="calendar-detail-column">
        <CalendarCategoryKey />
        <div className="calendar-detail-scroll" ref={detailViewRef}>
          <CalendarDetailView
            groupedItems={groupedItems}
            expandedItemId={expandedItemId}
            onItemClick={onItemClick}
          />
        </div>
      </div>
    </div>
  );
}

export default CalendarViewContainer;
