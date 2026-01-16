'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Event } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CalendarCard, { formatCalendarDate } from '@/components/ui/CalendarCard';
import { CalendarCardSkeleton } from '@/components/ui/CalendarCardSkeleton';
import { useEvents } from '@/hooks/useEvents';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const EVENT_TYPES = [
  { icon: '🏛️', title: 'Committee Meetings', desc: 'Monthly meetings to discuss community matters and make decisions.' },
  { icon: '🎉', title: 'Social Events', desc: 'Community gatherings, celebrations, and social activities.' },
  { icon: '🧹', title: 'Community Work', desc: 'Clean-up days, maintenance projects, and volunteer activities.' },
  { icon: '📊', title: 'Information Sessions', desc: 'Budget reviews, policy updates, and educational workshops.' },
];

/**
 * Upcoming events section with loading skeleton.
 */
function UpcomingEventsList() {
  const { data: events = [], isLoading } = useEvents({ upcoming: true });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <CalendarCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="text-center p-12 max-w-lg mx-auto">
        <div className="text-5xl mb-4 opacity-30">📅</div>
        <h3 className="font-display text-xl font-medium mb-4">No Upcoming Events</h3>
        <p className="opacity-70 mb-6">
          Check back soon for upcoming community events and meetings.
        </p>
        <Button variant="primary" asChild>
          <Link href="/blog">View Latest Blog</Link>
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {events.map((event) => {
        const { day, month } = formatCalendarDate(event.date);
        return (
          <CalendarCard
            key={event.id}
            event={event}
            day={day}
            month={month}
            showLocation
          />
        );
      })}
    </div>
  );
}

/**
 * Past events section with loading skeleton.
 */
function PastEventsList({ events }: { events: Event[] }) {
  const pastEvents = events.filter(e => new Date(e.date) < new Date()).slice(0, 4);

  if (pastEvents.length === 0) {
    return (
      <Card className="text-center p-12 max-w-lg mx-auto">
        <div className="text-5xl mb-4 opacity-30">📁</div>
        <h3 className="font-display text-xl font-medium mb-4">No Past Events</h3>
        <p className="opacity-70 mb-6">
          Past events will appear here after they have occurred.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
      {pastEvents.map((event) => {
        const { day, month } = formatCalendarDate(event.date);
        return (
          <CalendarCard
            key={event.id}
            event={event}
            day={day}
            month={month}
            showLocation
          />
        );
      })}
    </div>
  );
}

/**
 * Event types section - static, no loading needed.
 */
function EventTypes() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {EVENT_TYPES.map((type) => (
        <Card key={type.title} hover className="text-center p-6">
          <div className="text-4xl mb-4">{type.icon}</div>
          <h3 className="font-display text-lg font-medium mb-2">{type.title}</h3>
          <p className="text-sm opacity-70">{type.desc}</p>
        </Card>
      ))}
    </div>
  );
}

/**
 * CTA section for hosting events.
 */
function HostEventCTA() {
  return (
    <div className="max-w-3xl mx-auto text-center">
      <h2 className="text-bone mb-4">Want to Host an Event?</h2>
      <p className="text-lg opacity-80 mb-8">
        Have an idea for a community event? Get in touch with our committee to discuss.
      </p>
      <Button variant="primary" size="lg" asChild>
        <Link href="/contact">Request Event</Link>
      </Button>
    </div>
  );
}

/**
 * Events content wrapper with Headless UI Tabs for filtering.
 */
export default function EventsContent({ events }: { events: Event[] }) {
  return (
    <>
      {/* Upcoming & Past Events with Tabs */}
      <section className="section bg-forest-light texture-dots">
        <div className="container">
          <div className="max-w-[600px] mb-10 md:mb-12">
            <span className="text-eyebrow block mb-4 text-bone">Community Calendar</span>
            <h2 className="text-bone">Events</h2>
          </div>

          <Tab.Group>
            <Tab.List className="flex gap-4 mb-8">
              {[
                { id: 'upcoming', label: 'Upcoming Events' },
                { id: 'past', label: 'Past Events' },
              ].map((tab) => (
                <Tab key={tab.id} className={({ selected }) =>
                  cn(
                    'px-6 py-3 text-sm font-medium rounded-lg transition-all',
                    selected
                      ? 'bg-bone text-forest'
                      : 'text-bone/70 hover:text-bone hover:bg-white/5'
                  )
                }>
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <UpcomingEventsList />
              </Tab.Panel>
              <Tab.Panel>
                <PastEventsList events={events} />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </section>

      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">What We Offer</span>
            <h2>Types of Events</h2>
          </div>
          <EventTypes />
        </div>
      </section>

      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <HostEventCTA />
        </div>
      </section>
    </>
  );
}
