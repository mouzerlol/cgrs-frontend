'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
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
    <div className="event-mini-calendar">
      <div className="event-mini-calendar-header">
        <span className="event-mini-calendar-month">
          {format(eventDateObj, 'MMMM yyyy')}
        </span>
      </div>

      <div className="event-mini-calendar-grid">
        {WEEKDAYS.map((day, index) => (
          <div key={index} className="event-mini-calendar-weekday">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="event-mini-calendar-day-empty" />
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
              className={`event-mini-calendar-day ${
                isToday(day) ? 'event-mini-calendar-day-today' : ''
              } ${isCurrentDay ? 'event-mini-calendar-day-current' : ''} ${
                dayHasEvents ? 'event-mini-calendar-day-has-events' : ''
              }`}
              onMouseEnter={() => dayHasEvents && setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => dayHasEvents && handleDayClick(day)}
            >
              <span className="event-mini-calendar-day-number">
                {format(day, 'd')}
              </span>

              {otherEventsOnDay.length > 0 && (
                <div className="event-mini-calendar-dots">
                  {otherEventsOnDay.slice(0, 3).map((event, index) => (
                    <Link
                      key={event.slug}
                      href={`/calendar/${event.slug}`}
                      className={`event-mini-calendar-dot ${
                        event.eventType === 'Social'
                          ? 'event-mini-calendar-dot-social'
                          : event.eventType === 'Meeting'
                          ? 'event-mini-calendar-dot-meeting'
                          : event.eventType === 'Wellness'
                          ? 'event-mini-calendar-dot-wellness'
                          : 'event-mini-calendar-dot-default'
                      }`}
                      title={event.title}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ))}
                  {otherEventsOnDay.length > 3 && (
                    <span className="event-mini-calendar-more">+</span>
                  )}
                </div>
              )}

              {isCurrentDay && (
                <div className="event-mini-calendar-current-indicator" />
              )}

              {showPopup && allEventsOnDay.length > 0 && (
                <div className="event-mini-calendar-popup">
                  {allEventsOnDay.map((event) => (
                    <Link
                      key={event.slug}
                      href={`/calendar/${event.slug}`}
                      className="event-mini-calendar-popup-link"
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

      <div className="event-mini-calendar-legend">
        <span className="event-mini-calendar-legend-dot event-mini-calendar-dot-social" />
        <span className="event-mini-calendar-legend-label">Social</span>
        <span className="event-mini-calendar-legend-dot event-mini-calendar-dot-meeting" />
        <span className="event-mini-calendar-legend-label">Meeting</span>
        <span className="event-mini-calendar-legend-dot event-mini-calendar-dot-wellness" />
        <span className="event-mini-calendar-legend-label">Wellness</span>
      </div>

      <Link href="/calendar/" className="event-mini-calendar-back-link">
        <ArrowLeft size={16} />
        Back to Calendar
      </Link>
    </div>
  );
}
