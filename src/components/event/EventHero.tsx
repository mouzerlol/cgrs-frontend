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
    <div className={cn('relative w-full min-h-[400px] overflow-hidden', isPastEvent && 'opacity-80')}>
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className={cn(
            'object-cover transition-transform duration-500',
            isPastEvent && 'grayscale-[30%] contrast-[0.9]'
          )}
          priority
          sizes="(max-width: 768px) 100vw, 75vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/95 via-forest/50 to-forest/30" />
      </div>

      <div className="relative z-[1] p-xl px-md pt-[calc(70px+4rem)] md:pt-[calc(80px+4rem)] max-w-[800px] mx-auto">
        <div className="flex items-center gap-2.5 mb-sm flex-wrap">
          <Link
            href="/calendar"
            className="inline-flex items-center gap-xs text-bone text-sm font-medium no-underline opacity-80 transition-opacity duration-200 hover:opacity-100"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Calendar
          </Link>
          <div className="inline-block py-1 px-2 bg-terracotta text-bone text-[0.7rem] font-semibold uppercase tracking-[0.05em] rounded">
            {event.eventType}
          </div>
        </div>

        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-medium text-bone leading-[1.1] mb-lg">
          {event.title}
        </h1>

        <div className="flex flex-col gap-2 mb-lg">
          <div className="flex items-center gap-xs text-bone text-[0.875rem] opacity-90 [&>svg]:opacity-70 [&>svg]:shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            <Calendar size={16} />
            <span>{format(eventDate, 'EEEE, d MMMM yyyy')}</span>
          </div>
          <div className="flex items-center gap-xs text-bone text-[0.875rem] opacity-90 [&>svg]:opacity-70 [&>svg]:shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            <Clock size={16} />
            <span>{formatEventTime(event.time, event.endTime)}</span>
          </div>
          <div className="flex items-center gap-xs text-bone text-[0.875rem] opacity-90 [&>svg]:opacity-70 [&>svg]:shrink-0 [&>svg]:w-4 [&>svg]:h-4">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
        </div>

        {!isPastEvent && (
          <button
            onClick={() => downloadIcsFile(event)}
            className="inline-flex items-center gap-sm py-sm px-lg bg-bone text-forest border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-sage-light hover:-translate-y-0.5 [&>svg]:shrink-0"
          >
            <Calendar size={18} />
            Add to Calendar
          </button>
        )}
      </div>
    </div>
  );
}
