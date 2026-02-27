'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MiniCalendarEvent } from '@/types';

interface EventMiniCalendarProps {
  eventDate: string;
  currentEventSlug: string;
  currentEventTitle: string;
  currentEventType: string;
  otherEvents: MiniCalendarEvent[];
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function EventMiniCalendar({
  eventDate,
  currentEventSlug,
  currentEventTitle,
  currentEventType,
  otherEvents,
}: EventMiniCalendarProps) {
  const eventDateObj = parseISO(eventDate);
  const currentMonth = startOfMonth(eventDateObj);
  const monthEnd = endOfMonth(eventDateObj);
  const [hoveredDay, setHoveredDay] = useState<Date | null>(null);
  const [clickedDay, setClickedDay] = useState<Date | null>(null);

  const days = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(eventDateObj),
      end: endOfMonth(eventDateObj),
    });
  }, [eventDateObj]);

  const firstDayOfWeek = startOfMonth(eventDateObj).getDay();

  const getOtherEventsForDay = (day: Date) => {
    return otherEvents.filter((event) => isSameDay(parseISO(event.date), day));
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  const isCurrentEventDay = (day: Date) => isSameDay(day, eventDateObj);

  const hasEvents = (day: Date) => {
    const eventsOnDay = getOtherEventsForDay(day);
    return eventsOnDay.length > 0 || isCurrentEventDay(day);
  };

  const handleDayClick = (day: Date) => {
    const eventsOnDay = getOtherEventsForDay(day);
    if (eventsOnDay.length > 0) {
      setClickedDay(clickedDay && isSameDay(clickedDay, day) ? null : day);
    } else if (isCurrentEventDay(day)) {
      // Current event day - could navigate to current event or just show popup
      setClickedDay(clickedDay && isSameDay(clickedDay, day) ? null : day);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-md border border-sage">
      <div className="flex items-center justify-between mb-md">
        <span className="font-display text-base font-medium text-forest">
          {format(eventDateObj, 'MMMM yyyy')}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS.map((day, index) => (
          <div key={index} className="text-center text-xs font-semibold text-forest/50 p-xs">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square flex flex-col items-center justify-start p-xs relative" />
        ))}

        {days.map((day) => {
          const otherEventsOnDay = getOtherEventsForDay(day);
          const isCurrentDay = isCurrentEventDay(day);
          const dayHasEvents = hasEvents(day);
          const allEventsOnDay = isCurrentDay
            ? [{ slug: currentEventSlug, title: currentEventTitle, date: eventDate, eventType: currentEventType }, ...otherEventsOnDay]
            : otherEventsOnDay;
          const showPopup = (hoveredDay && isSameDay(hoveredDay, day)) || (clickedDay && isSameDay(clickedDay, day));

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'aspect-square flex flex-col items-center justify-start p-xs relative cursor-default',
                isToday(day) && 'bg-sage-light rounded-full',
                isCurrentDay && 'bg-terracotta rounded-lg',
                dayHasEvents && 'bg-sage/15 rounded hover:bg-sage/25 hover:cursor-pointer'
              )}
              onMouseEnter={() => dayHasEvents && setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => dayHasEvents && handleDayClick(day)}
            >
              <span className={cn(
                'text-sm text-forest font-medium',
                isToday(day) && 'font-bold text-forest',
                isCurrentDay && 'text-white font-bold'
              )}>
                {format(day, 'd')}
              </span>

              {otherEventsOnDay.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {otherEventsOnDay.slice(0, 3).map((event, index) => (
                    <Link
                      key={event.slug}
                      href={`/calendar/${event.slug}`}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full cursor-pointer transition-transform duration-200 hover:scale-150',
                        event.eventType === 'Social' && 'bg-terracotta',
                        event.eventType === 'Meeting' && 'bg-forest',
                        event.eventType === 'Wellness' && 'bg-[#4CAF50]',
                        event.eventType !== 'Social' && event.eventType !== 'Meeting' && event.eventType !== 'Wellness' && 'bg-sage'
                      )}
                      title={event.title}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ))}
                  {otherEventsOnDay.length > 3 && (
                    <span className="text-[8px] text-forest/50">+</span>
                  )}
                </div>
              )}

              {isCurrentDay && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-terracotta rounded-full" />
              )}

              {showPopup && allEventsOnDay.length > 0 && (
                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-forest text-bone p-1 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[1000] min-w-[180px] max-w-[250px] whitespace-normal text-left after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-forest">
                  {allEventsOnDay.map((event) => (
                    <Link
                      key={event.slug}
                      href={`/calendar/${event.slug}`}
                      className="block text-bone no-underline p-sm px-md text-sm transition-all duration-200 rounded-md bg-transparent border-none text-left w-full cursor-pointer hover:bg-bone/15"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-xs gap-x-sm mt-md pt-sm border-t border-sage-light flex-nowrap justify-center items-center text-xs">
        <span className="w-2 h-2 rounded-full bg-terracotta" />
        <span className="text-xs text-forest/70 whitespace-nowrap">Social</span>
        <span className="w-2 h-2 rounded-full bg-forest" />
        <span className="text-xs text-forest/70 whitespace-nowrap">Meeting</span>
        <span className="w-2 h-2 rounded-full bg-[#4CAF50]" />
        <span className="text-xs text-forest/70 whitespace-nowrap">Wellness</span>
      </div>

      <Link href="/calendar/" className="flex items-center justify-center gap-xs mt-md pt-sm border-t border-sage-light text-center text-forest no-underline text-sm font-medium transition-colors duration-200 hover:text-terracotta hover:underline">
        <ArrowLeft size={16} />
        Back to Calendar
      </Link>
    </div>
  );
}
