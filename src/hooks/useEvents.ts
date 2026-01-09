import { useQuery } from '@tanstack/react-query';
import { getEvents } from '@/lib/api/events';

export function useEvents(options?: { limit?: number; featured?: boolean; upcoming?: boolean }) {
  return useQuery({
    queryKey: ['events', options],
    queryFn: () => getEvents(options),
  });
}
