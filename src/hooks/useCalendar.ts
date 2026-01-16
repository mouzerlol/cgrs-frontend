import { useQuery } from '@tanstack/react-query';
import { getCalendarItems, getAllCalendarItems } from '@/lib/api/calendar';
import type { CalendarItemType } from '@/types';

export interface UseCalendarOptions {
  type?: CalendarItemType;
  month?: Date;
  limit?: number;
}

export function useCalendar(options?: UseCalendarOptions) {
  return useQuery({
    queryKey: ['calendar', options],
    queryFn: () => getCalendarItems(options),
  });
}

export function useAllCalendarItems() {
  return useQuery({
    queryKey: ['calendar', 'all'],
    queryFn: () => getAllCalendarItems(),
  });
}
