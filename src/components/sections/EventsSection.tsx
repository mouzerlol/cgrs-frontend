'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { Event } from '@/types';
import Icon from '@/components/ui/Icon';

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleDateString('en-NZ', { month: 'short' }),
    };
  };

  return (
    <section className="section bg-forest-light texture-dots" id="events">
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
            const { day, month } = formatDate(event.date);
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

/**
 * Calendar card with enhanced date badge styling.
 * Features terracotta date badge with hover lift effect.
 */
function CalendarCard({
  event,
  day,
  month,
}: {
  event: Event;
  day: string;
  month: string;
}) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  // Use a placeholder image if none provided
  const imageUrl = event.image || '/images/events/barbecue.svg';

  return (
    <article
      ref={ref}
      className={`
        calendar-card
        fade-up ${isVisible ? 'visible' : ''}
      `}
    >
      {/* Event image */}
      <div className="calendar-image-wrapper">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="calendar-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* Terracotta date badge - overlaying image */}
        <div className="calendar-date-badge">
          <span className="calendar-day">{day}</span>
          <span className="calendar-month">{month}</span>
        </div>
      </div>

      {/* Card content */}
      <div className="calendar-content">
        <h3 className="calendar-title">{event.title}</h3>
        <p className="calendar-description">{event.description}</p>
        <span className="calendar-time">{event.time}</span>
      </div>
    </article>
  );
}
