import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDay,
  getDaysInMonth,
  parseISO,
  isToday,
  isSameMonth,
  isSameDay,
} from 'date-fns';
import { enNZ } from 'date-fns/locale';
import type { CalendarItem, DateGrouping, MonthData } from '@/types';

/**
 * Calculate month metadata for calendar grid rendering
 */
export function calculateMonthData(monthStart: Date): MonthData {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const firstDay = startOfMonth(monthStart);
  const prevMonth = subMonths(firstDay, 1);

  return {
    year,
    month,
    firstDayOfWeek: getDay(firstDay),
    daysInMonth: getDaysInMonth(monthStart),
    daysInPrevMonth: getDaysInMonth(prevMonth),
  };
}

/**
 * Generate all calendar days including overflow from prev/next months
 * Returns 35 or 42 days to fill a 5 or 6 week grid
 */
export function generateCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
}

/**
 * Group items by date for the detail view
 * Only includes dates that have items in the current month
 */
export function groupItemsByDate(
  items: CalendarItem[],
  currentMonth: Date
): DateGrouping[] {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Filter items to current month
  const monthItems = items.filter((item) => {
    const itemDate = parseISO(item.date);
    return itemDate >= monthStart && itemDate <= monthEnd;
  });

  // Group by date
  const groupMap = new Map<string, CalendarItem[]>();
  monthItems.forEach((item) => {
    const existing = groupMap.get(item.date) || [];
    groupMap.set(item.date, [...existing, item]);
  });

  // Convert to array and sort by date
  const groups: DateGrouping[] = Array.from(groupMap.entries())
    .map(([date, dateItems]) => ({ date, items: dateItems }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return groups;
}

/**
 * Create a Map for quick calendar grid lookup
 * Key is ISO date string (YYYY-MM-DD), value is array of items
 */
export function createDateItemMap(
  items: CalendarItem[],
  currentMonth: Date
): Map<string, CalendarItem[]> {
  const map = new Map<string, CalendarItem[]>();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  items.forEach((item) => {
    const itemDate = parseISO(item.date);
    if (itemDate >= monthStart && itemDate <= monthEnd) {
      const existing = map.get(item.date) || [];
      map.set(item.date, [...existing, item]);
    }
  });

  return map;
}

/**
 * Format date for detail view header
 * Example: "Friday, January 15, 2026"
 */
export function formatDateHeader(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'EEEE, MMMM d, yyyy', { locale: enNZ });
}

/**
 * Format month and year for navigation header
 * Example: "January 2026"
 */
export function formatMonthYear(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: enNZ });
}

/**
 * Format a date object to ISO string (YYYY-MM-DD)
 */
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Format day number for calendar cell
 */
export function formatDayNumber(date: Date): string {
  return format(date, 'd');
}

/**
 * Check if a date string represents today
 */
export function isTodayDate(dateString: string): boolean {
  const date = parseISO(dateString);
  return isToday(date);
}

/**
 * Check if a Date object is today
 */
export function checkIsToday(date: Date): boolean {
  return isToday(date);
}

/**
 * Check if a date is in the current displayed month
 */
export function isCurrentMonth(date: Date, currentMonth: Date): boolean {
  return isSameMonth(date, currentMonth);
}

/**
 * Check if two dates are the same day
 */
export function areSameDay(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
}

/**
 * Navigate to next month
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

/**
 * Navigate to previous month
 */
export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1);
}

/**
 * Parse an ISO date string to Date object
 */
export function parseDateString(dateString: string): Date {
  return parseISO(dateString);
}
