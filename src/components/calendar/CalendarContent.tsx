'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarViewContainer } from './CalendarViewContainer';
import { useAllCalendarItems } from '@/hooks/useCalendar';
import { useScrollToDate } from '@/hooks/useScrollToDate';
import {
  groupItemsByDate,
  createDateItemMap,
  getNextMonth,
  getPrevMonth,
} from '@/lib/calendar-utils';

export function CalendarContent() {
  const searchParams = useSearchParams();
  const pendingScrollRef = useRef<string | null>(null);
  const { data: items = [], isLoading, error } = useAllCalendarItems();

  // Initialize state from URL params if present
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const monthParam = searchParams.get('month');
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      return new Date(year, month - 1, 1);
    }
    return new Date();
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const itemParam = searchParams.get('item');
    return itemParam ? null : null; // Will be set after items load
  });

  const [expandedItemId, setExpandedItemId] = useState<string | null>(() => {
    return searchParams.get('item');
  });

  const { containerRef, scrollToDate } = useScrollToDate();

  // Find item from URL and set up initial state after items load
  useEffect(() => {
    if (items.length > 0 && searchParams.has('item')) {
      const itemId = searchParams.get('item');
      const monthParam = searchParams.get('month');
      
      const item = items.find(i => i.id === itemId);
      if (item) {
        // Set the date from the item
        setSelectedDate(item.date);
        pendingScrollRef.current = item.date;
        setExpandedItemId(itemId);
        
        // If month param exists, ensure we're in that month
        if (monthParam) {
          const [year, month] = monthParam.split('-').map(Number);
          const targetMonth = new Date(year, month - 1, 1);
          setCurrentMonth(targetMonth);
        }
      }
    }
  }, [items, searchParams]);

  // Derived state
  const groupedItems = useMemo(
    () => groupItemsByDate(items, currentMonth),
    [items, currentMonth]
  );

  const itemsByDate = useMemo(
    () => createDateItemMap(items, currentMonth),
    [items, currentMonth]
  );

  // Handle pending scroll after animations complete
  useEffect(() => {
    if (pendingScrollRef.current && containerRef.current) {
      const dateString = pendingScrollRef.current;
      pendingScrollRef.current = null;

      // Wait for Framer Motion animation to complete (300ms)
      const timer = setTimeout(() => {
        scrollToDate(dateString);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [expandedItemId, scrollToDate]);

  // Event handlers
  const handlePrevMonth = useCallback(() => {
    setCurrentMonth((prev) => getPrevMonth(prev));
    setExpandedItemId(null);
    setSelectedDate(null);
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth((prev) => getNextMonth(prev));
    setExpandedItemId(null);
    setSelectedDate(null);
  }, []);

  const handleMonthSelect = useCallback((month: Date) => {
    setCurrentMonth(month);
    setExpandedItemId(null);
    setSelectedDate(null);
  }, []);

  const handleDateClick = useCallback(
    (dateString: string) => {
      setSelectedDate(dateString);
      pendingScrollRef.current = dateString;
      
      const items = itemsByDate.get(dateString);
      if (items && items.length > 0) {
        setExpandedItemId(items[0].id);
      } else {
        setExpandedItemId(null);
      }
    },
    [itemsByDate]
  );

  const handleItemClick = useCallback((itemId: string) => {
    setExpandedItemId((prev) => (prev === itemId ? null : itemId));
  }, []);

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-xl bg-terracotta/10 rounded-xl text-terracotta">
        <p>Unable to load calendar. Please try again later.</p>
      </div>
    );
  }

  return (
    <CalendarViewContainer
      currentMonth={currentMonth}
      itemsByDate={itemsByDate}
      groupedItems={groupedItems}
      selectedDate={selectedDate}
      expandedItemId={expandedItemId}
      detailViewRef={containerRef}
      items={items}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onDateClick={handleDateClick}
      onItemClick={handleItemClick}
      onMonthSelect={handleMonthSelect}
    />
  );
}

function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-0 w-full h-auto lg:grid lg:grid-cols-[45%_55%] lg:grid-rows-[auto_1fr] lg:h-[calc(100vh-120px)] lg:overflow-hidden lg:w-[calc(100vw-20px)] lg:ml-[calc(-50vw+50%+10px)] lg:mr-[calc(-50vw+50%+10px)]">
      <div className="bg-forest-light order-0 lg:col-span-2 lg:row-start-1 lg:row-end-2 lg:grid lg:grid-cols-[45%_55%] lg:items-center">
        <div className="bg-forest-light px-sm py-1.5 text-bone flex flex-row items-center gap-md shrink-0 z-10">
          <div className="flex gap-md items-center">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-3 w-16 rounded" />
          </div>
        </div>
        <div className="hidden lg:flex lg:px-md lg:py-2">
          <div className="skeleton h-full w-full rounded" />
        </div>
      </div>
      <div className="bg-sage-light rounded-b-[16px] h-auto flex flex-col overflow-visible order-1 lg:rounded-none lg:h-full lg:overflow-hidden lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3 lg:order-1 lg:shadow-[4px_0_24px_rgba(26,34,24,0.05)] lg:z-10">
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-sage-light px-3">
          <div className="space-y-4 p-md">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-t-[16px] p-sm shadow-[0_4px_24px_rgba(26,34,24,0.08)] flex flex-col gap-sm h-auto overflow-visible order-2 lg:rounded-none lg:px-md lg:py-md lg:pr-lg lg:gap-md lg:h-full lg:overflow-hidden lg:col-start-2 lg:col-end-3 lg:row-start-2 lg:row-end-3 lg:order-3">
        <div className="flex-1 overflow-y-visible overflow-x-hidden min-h-0 flex flex-col lg:overflow-y-hidden lg:h-full">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="skeleton h-8 w-40 mx-auto rounded" />
            </div>
            <div className="grid grid-cols-7 gap-1 mt-md">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="skeleton h-20 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { CalendarSkeleton };

export default CalendarContent;
