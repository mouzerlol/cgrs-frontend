import type { CalendarItem, CalendarItemType } from '@/types';
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

interface CalendarData {
  items: CalendarItem[];
}

async function importCalendarData(): Promise<CalendarData> {
  const data = await import('@/data/calendar-items.json');
  return data.default as CalendarData;
}

export interface GetCalendarItemsOptions {
  type?: CalendarItemType;
  month?: Date;
  limit?: number;
}

/**
 * Get calendar items with optional filtering
 */
export async function getCalendarItems(
  options?: GetCalendarItemsOptions
): Promise<CalendarItem[]> {
  const { items } = await importCalendarData();
  let result = items;

  // Filter by type
  if (options?.type) {
    result = result.filter((item) => item.type === options.type);
  }

  // Filter by month
  if (options?.month) {
    const monthStart = startOfMonth(options.month);
    const monthEnd = endOfMonth(options.month);
    result = result.filter((item) => {
      const itemDate = parseISO(item.date);
      return isWithinInterval(itemDate, { start: monthStart, end: monthEnd });
    });
  }

  // Sort by date
  result = result.sort((a, b) => a.date.localeCompare(b.date));

  // Apply limit
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

/**
 * Get a single calendar item by ID
 */
export async function getCalendarItem(id: string): Promise<CalendarItem | null> {
  const { items } = await importCalendarData();
  return items.find((item) => item.id === id) || null;
}

/**
 * Get all calendar items (no filtering)
 */
export async function getAllCalendarItems(): Promise<CalendarItem[]> {
  const { items } = await importCalendarData();
  return items.sort((a, b) => a.date.localeCompare(b.date));
}
