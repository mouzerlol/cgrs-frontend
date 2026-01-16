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
      <div className="calendar-error">
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
    <div className="calendar-view-container">
      <div className="calendar-grid-column">
        <div className="month-calendar">
          <div className="month-navigation">
            <div className="skeleton h-8 w-40 mx-auto rounded" />
          </div>
          <div className="calendar-grid-skeleton">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
      <div className="calendar-detail-column">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export { CalendarSkeleton };

export default CalendarContent;
