'use client';

import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Event } from '@/types';
import { cn } from '@/lib/utils';

interface EventHeroProps {
  event: Event;
  isPastEvent?: boolean;
}

function formatEventTime(time: string, endTime?: string): string {
  if (endTime) {
    return `${time} - ${endTime}`;
  }
  return time;
}

function generateIcsContent(event: Event): string {
  const startDate = format(parseISO(`${event.date}T${event.time}`), "yyyyMMdd'T'HHmmss");
  const endDate = event.endTime
    ? format(parseISO(`${event.date}T${event.endTime}`), "yyyyMMdd'T'HHmmss")
    : startDate;

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CGRS//Event//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@cgrs.co.nz`,
    `DTSTAMP:${startDate}Z`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return encodeURIComponent(icsContent);
}

function downloadIcsFile(event: Event) {
  const icsContent = generateIcsContent(event);
  const blob = new Blob([decodeURIComponent(icsContent)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.slug}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function EventHero({ event, isPastEvent = false }: EventHeroProps) {
  const eventDate = parseISO(event.date);
  const imageUrl = event.image || '/images/events/default.svg';

  return (
    <div className={cn('event-hero', isPastEvent && 'event-hero-past')}>
      <div className="event-hero-image-wrapper">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="event-hero-image"
          priority
          sizes="(max-width: 768px) 100vw, 75vw"
        />
        <div className="event-hero-overlay" />
      </div>

      <div className="event-hero-content">
        <div className="event-hero-top-row">
          <Link href="/calendar" className="event-hero-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Calendar
          </Link>
          <div className="event-hero-tag">
            {event.eventType}
          </div>
        </div>

        <h1 className="event-hero-title">{event.title}</h1>

        <div className="event-hero-meta">
          <div className="event-hero-meta-item">
            <Calendar size={16} />
            <span>{format(eventDate, 'EEEE, d MMMM yyyy')}</span>
          </div>
          <div className="event-hero-meta-item">
            <Clock size={16} />
            <span>{formatEventTime(event.time, event.endTime)}</span>
          </div>
          <div className="event-hero-meta-item">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
        </div>

        {!isPastEvent && (
          <button
            onClick={() => downloadIcsFile(event)}
            className="event-hero-add-calendar"
          >
            <Calendar size={18} />
            Add to Calendar
          </button>
        )}
      </div>
    </div>
  );
}
