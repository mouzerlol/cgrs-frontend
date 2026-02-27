'use client';

import { Event } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { formatDate } from '@/lib/utils';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured';
}

/**
 * Event card component for upcoming events.
 * Shows event details with date badge and RSVP button.
 */
export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const date = new Date(event.date);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleDateString('en-NZ', { month: 'short' });

  return (
    <div ref={ref} className={`fade-up ${isVisible ? 'visible' : ''}`}>
      <Card hover className="h-full flex flex-col p-6">
        <div className="flex gap-4 mb-4">
          <div className="flex flex-col items-center justify-center bg-terracotta text-bone rounded-lg w-14 h-16 flex-shrink-0 shadow-sm">
            <span className="font-display text-xl font-bold leading-none">{day}</span>
            <span className="text-[0.65rem] uppercase tracking-wider leading-none mt-0.5">{month}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-display text-xl font-medium mb-2">{event.title}</h3>
              {event.featured && variant === 'featured' && (
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

/**
 * Past event card - simpler display without action button.
 */
export function PastEventCard({ event }: { event: Event }) {
  return (
    <Card className="p-4 opacity-60">
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
  );
}
