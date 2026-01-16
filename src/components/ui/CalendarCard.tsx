'use client';

import Image from 'next/image';
import { Event, CalendarItem } from '@/types';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

interface CalendarCardProps {
  event: Event | CalendarItem;
  day: string;
  month: string;
  showLocation?: boolean;
  onClick?: () => void;
}

/**
 * Calendar card with enhanced date badge styling.
 * Features terracotta date badge with hover lift effect.
 */
export default function CalendarCard({ event, day, month, showLocation = false, onClick }: CalendarCardProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLElement>({ threshold: 0.1 });

  const imageUrl = (event as CalendarItem).image || event.image || '/images/events/barbecue.svg';
  const location = (event as Event).location;
  const time = event.time;

  const articleProps = onClick ? { onClick, role: 'button', tabIndex: 0 } : {};

  return (
    <article
      ref={ref}
      className={`calendar-card fade-up ${isVisible ? 'visible' : ''}`}
      {...articleProps}
    >
      <div className="calendar-image-wrapper">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="calendar-image"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="calendar-date-badge">
          <span className="calendar-day">{day}</span>
          <span className="calendar-month">{month}</span>
        </div>
      </div>

      <div className="calendar-content">
        <h3 className="calendar-title">{event.title}</h3>
        <p className="calendar-description">{event.description}</p>
        <div className="calendar-meta">
          <span className="calendar-time">{time}</span>
          {showLocation && location && <span className="calendar-location">{location}</span>}
        </div>
      </div>
    </article>
  );
}

/**
 * Utility function to format date for calendar cards.
 */
export function formatCalendarDate(dateStr: string): { day: string; month: string } {
  const date = new Date(dateStr);
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: date.toLocaleDateString('en-NZ', { month: 'short' }),
  };
}
