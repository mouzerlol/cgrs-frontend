'use client';

import { Event } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/sections/PageHeader';
import { formatDate } from '@/lib/utils';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import Link from 'next/link';

// Import data
import eventsData from '@/data/events.json';

const EVENT_TYPES = [
  { icon: '🏛️', title: 'Committee Meetings', desc: 'Monthly meetings to discuss community matters and make decisions.' },
  { icon: '🎉', title: 'Social Events', desc: 'Community gatherings, celebrations, and social activities.' },
  { icon: '🧹', title: 'Community Work', desc: 'Clean-up days, maintenance projects, and volunteer activities.' },
  { icon: '📊', title: 'Information Sessions', desc: 'Budget reviews, policy updates, and educational workshops.' },
];

/**
 * Events page with new design system.
 */
export default function EventsPage() {
  const events = eventsData.events as Event[];
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date) >= now);
  const pastEvents = events.filter(event => new Date(event.date) < now);

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Events"
        description="Join us for community meetings, social gatherings, and special events throughout the year."
        eyebrow="Events"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      {/* Upcoming Events */}
      <section className="section bg-bone">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">Mark Your Calendar</span>
            <h2>Upcoming Events</h2>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-12 max-w-lg mx-auto">
              <div className="text-5xl mb-4 opacity-30">📅</div>
              <h3 className="font-display text-xl font-medium mb-4">No Upcoming Events</h3>
              <p className="opacity-70 mb-6">
                Check back soon for upcoming community events and meetings.
              </p>
              <Button variant="primary" asChild>
                <Link href="/news">View Latest News</Link>
              </Button>
            </Card>
          )}
        </div>
      </section>

      {/* Event Types */}
      <section className="section bg-sage-light">
        <div className="container">
          <div className="text-center mb-10">
            <span className="text-eyebrow block mb-4">What We Offer</span>
            <h2>Types of Events</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {EVENT_TYPES.map((type) => (
              <Card key={type.title} hover className="text-center p-6">
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="font-display text-lg font-medium mb-2">{type.title}</h3>
                <p className="text-sm opacity-70">{type.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <section className="section bg-bone">
          <div className="container">
            <div className="text-center mb-10">
              <span className="text-eyebrow block mb-4">Looking Back</span>
              <h2>Recent Events</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {pastEvents.slice(0, 4).map((event) => (
                <Card key={event.id} className="p-4 opacity-60">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display text-lg font-medium">{event.title}</h3>
                    <span className="text-xs bg-sage text-forest px-2 py-0.5 rounded">Past</span>
                  </div>
                  <div className="text-sm opacity-70 space-y-1 mb-2">
                    <p>📅 {formatDate(event.date)}</p>
                    <p>🕐 {event.time}</p>
                    <p>📍 {event.location}</p>
                  </div>
                  <p className="text-sm opacity-60">{event.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-forest-light text-bone texture-dots">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-bone mb-4">Want to Host an Event?</h2>
            <p className="text-lg opacity-80 mb-8">
              Have an idea for a community event? Get in touch with our committee to discuss.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/contact">Request Event</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const date = new Date(event.date);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-NZ', { month: 'short' });

  return (
    <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
      <Card hover className="h-full flex flex-col p-6">
        <div className="flex gap-4 mb-4">
          <div className="event-date-badge flex-shrink-0">
            <span className="event-day">{day}</span>
            <span className="event-month">{month}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl font-medium mb-2">{event.title}</h3>
              {event.featured && (
                <span className="text-xs bg-terracotta text-bone px-2 py-0.5 rounded">Featured</span>
              )}
            </div>
            <div className="text-sm opacity-60 space-y-1">
              <p>🕐 {event.time}</p>
              <p>📍 {event.location}</p>
            </div>
          </div>
        </div>

        <p className="opacity-70 mb-4 flex-1">{event.description}</p>

        <Button
          variant={event.rsvp ? 'primary' : 'outline'}
          className="w-full"
        >
          {event.rsvp ? 'RSVP Required' : 'More Info'}
        </Button>
      </Card>
    </div>
  );
}
