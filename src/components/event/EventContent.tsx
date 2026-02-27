'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { parseISO, isPast } from 'date-fns';
import { Event, MiniCalendarEvent } from '@/types';
import EventHero from './EventHero';
import EventMiniCalendar from '@/components/calendar/EventMiniCalendar';
import EventRsvpButton from '@/components/calendar/EventRsvpButton';
import EventDiscussion from './EventDiscussion';
import EventOrganizer from './EventOrganizer';

const EventMapStatic = dynamic(() => import('@/components/calendar/EventMapStatic'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        background: '#1A2218',
      }}
    />
  ),
});

interface EventContentProps {
  event: Event;
  allEvents: Event[];
}

export default function EventContent({ event, allEvents }: EventContentProps) {
  const eventDate = parseISO(event.date);
  const isPastEvent = isPast(eventDate);

  const otherEventsInMonth = useMemo(() => {
    return allEvents
      .filter((e) => {
        if (e.id === event.id) return false;
        const eDate = parseISO(e.date);
        return (
          eDate.getMonth() === eventDate.getMonth() &&
          eDate.getFullYear() === eventDate.getFullYear()
        );
      })
      .map((e): MiniCalendarEvent => ({
        slug: e.slug,
        title: e.title,
        date: e.date,
        eventType: e.eventType,
      }));
  }, [allEvents, event.id, eventDate]);

  return (
    <div className="min-h-screen">
      <EventHero event={event} isPastEvent={isPastEvent} />

      <div
        className="p-lg px-md"
        style={{ containerType: 'inline-size', containerName: 'event-content' }}
      >
        <div className="event-content-grid grid grid-cols-1 gap-lg max-w-[1200px] mx-auto">
          <div className="min-w-0">
            <section className="mb-xl">
              <div className="text-forest leading-[1.8] [&>p]:mb-md">
                {event.fullContent?.split('\n\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return null;

                  if (trimmed.startsWith('- ')) {
                    const items = trimmed.split('\n').filter((i) => i.trim().startsWith('- '));
                    return (
                      <ul key={index} className="list-disc list-inside mb-md [&>li]:mb-xs">
                        {items.map((item, i) => (
                          <li key={i}>{item.replace(/^- /, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  return <p key={index}>{trimmed}</p>;
                })}
              </div>

              {event.organizer && (
                <div className="pt-md mt-md border-t border-sage-light">
                  <EventOrganizer organizer={event.organizer} />
                </div>
              )}
            </section>

            {event.hasMap && (
              <section className="mb-xl">
                <EventMapStatic
                  destination={event.mapDestination || null}
                  showBoundary={!event.mapDestination}
                />
              </section>
            )}

            <EventDiscussion
              threadId={event.discussionThreadId || `thread-events-${event.id}`}
              eventTitle={event.title}
              eventDescription={event.description}
            />
          </div>

          <aside className="event-content-sidebar flex flex-col gap-lg">
            <EventMiniCalendar
              eventDate={event.date}
              currentEventSlug={event.slug}
              currentEventTitle={event.title}
              currentEventType={event.eventType}
              otherEvents={otherEventsInMonth}
            />
            {event.rsvp && (
              <section className="mb-xl">
                <EventRsvpButton
                  eventId={event.id}
                  attendeeCount={Math.floor(Math.random() * 20) + 5}
                  isPastEvent={isPastEvent}
                />
              </section>
            )}
          </aside>
        </div>
      </div>

      {/* Container query: at 900px+ switch to 2-col grid with sticky sidebar */}
      <style>{`
        @container event-content (min-width: 900px) {
          .event-content-grid {
            grid-template-columns: 1fr 280px;
            align-items: start;
          }
          .event-content-sidebar {
            position: sticky;
            top: 100px;
          }
        }
      `}</style>
    </div>
  );
}
