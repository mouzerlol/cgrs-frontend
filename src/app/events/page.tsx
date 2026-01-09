'use client';

import { Event } from '@/types';
import PageHeader from '@/components/sections/PageHeader';
import EventsContent from '@/components/events/EventsContent';

// Import data
import eventsData from '@/data/events.json';

/**
 * Events page with React Query and Suspense loading states.
 */
export default function EventsPage() {
  const events = eventsData.events as Event[];

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Events"
        description="Join us for community meetings, social gatherings, and special events throughout the year."
        eyebrow="Events"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <EventsContent events={events} />
    </div>
  );
}
