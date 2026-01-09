'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Event } from '@/types';
import Icon from '@/components/ui/Icon';
import CalendarCard, { formatCalendarDate } from '@/components/ui/CalendarCard';

interface EventsSectionProps {
  events: Event[];
  title?: string;
  eyebrow?: string;
  showViewAll?: boolean;
}

/**
 * Events section with dark forest-light background.
 * Features enhanced calendar cards with date badges in terracotta.
 */
export default function EventsSection({
  events,
  title = 'Community<br>Events',
  eyebrow = "What's On",
  showViewAll = true,
}: EventsSectionProps) {
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="section bg-forest-light texture-signal" id="events">
      <div className="container">
        <div
          ref={headerRef}
          className={`max-w-[600px] mb-10 md:mb-12 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">{eyebrow}</span>
          <h2 className="text-bone" dangerouslySetInnerHTML={{ __html: title }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {events.map((event) => {
            const { day, month } = formatCalendarDate(event.date);
            return (
              <CalendarCard key={event.id} event={event} day={day} month={month} />
            );
          })}
        </div>

        {showViewAll && (
          <div className="text-center mt-10">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-sm font-medium text-bone uppercase tracking-wider hover:text-terracotta transition-colors"
            >
              View All Events
              <Icon name="arrow-right" size="sm" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
