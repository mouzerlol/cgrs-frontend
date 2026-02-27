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
    <div className="flex flex-col gap-0 w-full h-auto lg:grid lg:grid-cols-[45%_55%] lg:grid-rows-[auto_1fr] lg:h-[calc(100vh-120px)] lg:overflow-hidden lg:w-[calc(100vw-20px)] lg:ml-[calc(-50vw+50%+10px)] lg:mr-[calc(-50vw+50%+10px)]">
      <div className="bg-forest-light order-0 lg:col-span-2 lg:row-start-1 lg:row-end-2 lg:grid lg:grid-cols-[45%_55%] lg:items-center">
        <CalendarCategoryKey variant="compact" />
        <div className="hidden lg:flex lg:px-md lg:py-2">
          <MonthNavigation
            currentMonth={currentMonth}
            items={items}
            onMonthSelect={onMonthSelect}
          />
        </div>
      </div>
      <div className="bg-sage-light rounded-b-[16px] h-auto flex flex-col overflow-visible order-1 lg:rounded-none lg:h-full lg:overflow-hidden lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3 lg:order-1 lg:shadow-[4px_0_24px_rgba(26,34,24,0.05)] lg:z-10">
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-sage-light px-3" ref={detailViewRef}>
          <CalendarDetailView
            groupedItems={groupedItems}
            expandedItemId={expandedItemId}
            onItemClick={onItemClick}
          />
        </div>
      </div>
      <div className="bg-white rounded-t-[16px] p-sm shadow-[0_4px_24px_rgba(26,34,24,0.08)] flex flex-col gap-sm h-auto overflow-visible order-2 lg:rounded-none lg:px-md lg:py-md lg:pr-lg lg:gap-md lg:h-full lg:overflow-hidden lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3 lg:order-3">
        <div className="flex-1 overflow-y-visible overflow-x-hidden min-h-0 flex flex-col lg:overflow-y-hidden lg:h-full">
          <MonthCalendar
            currentMonth={currentMonth}
            itemsByDate={itemsByDate}
            selectedDate={selectedDate}
            onPrevMonth={onPrevMonth}
            onNextMonth={onNextMonth}
            onDateClick={onDateClick}
          />
        </div>
      </div>
    </div>
  );
}

export default CalendarViewContainer;
