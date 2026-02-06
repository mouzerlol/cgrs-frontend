import { notFound } from 'next/navigation';
import { Event } from '@/types';
import EventContent from '@/components/event/EventContent';
import eventsData from '@/data/events.json';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const events = eventsData.events as Event[];
  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params;
  const events = eventsData.events as Event[];
  const event = events.find((e) => e.slug === slug);

  if (!event) {
    notFound();
  }

  return <EventContent event={event} allEvents={events} />;
}
