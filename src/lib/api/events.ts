import { Event } from '@/types';

interface EventsData {
  events: Event[];
}

async function importEventsData(): Promise<EventsData> {
  const data = await import('@/data/events.json');
  return data.default as EventsData;
}

export async function getEvents(options?: {
  limit?: number;
  featured?: boolean;
  upcoming?: boolean;
}): Promise<Event[]> {
  const { events } = await importEventsData();
  let result = events;

  if (options?.featured) {
    result = result.filter(e => e.featured);
  }
  if (options?.upcoming) {
    const today = new Date().toISOString().split('T')[0];
    result = result.filter(e => e.date >= today);
  }
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

export async function getEvent(id: string): Promise<Event | null> {
  const { events } = await importEventsData();
  return events.find(e => e.id === id) || null;
}
