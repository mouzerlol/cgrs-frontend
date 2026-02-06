'use client';

import { useState, useEffect } from 'react';
import { RsvpStatus } from '@/types';
import { cn } from '@/lib/utils';

interface EventRsvpButtonProps {
  eventId: string;
  attendeeCount?: number;
  isPastEvent?: boolean;
}

const RSVP_OPTIONS: { status: RsvpStatus; label: string }[] = [
  { status: 'attending', label: 'Attending' },
  { status: 'interested', label: 'Interested' },
];

function getStorageKey(eventId: string) {
  return `event-rsvp-${eventId}`;
}

export default function EventRsvpButton({
  eventId,
  attendeeCount = 0,
  isPastEvent = false,
}: EventRsvpButtonProps) {
  const [selectedStatus, setSelectedStatus] = useState<RsvpStatus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(eventId));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSelectedStatus(parsed.status);
      } catch {
        // Invalid stored data, ignore
      }
    }
    setIsLoaded(true);
  }, [eventId]);

  const handleRsvp = (status: RsvpStatus) => {
    if (isPastEvent) return;

    if (selectedStatus === status) {
      setSelectedStatus(null);
      localStorage.removeItem(getStorageKey(eventId));
    } else {
      setSelectedStatus(status);
      localStorage.setItem(
        getStorageKey(eventId),
        JSON.stringify({ status, timestamp: new Date().toISOString() })
      );
    }
  };

  if (!isLoaded) {
    return null;
  }

  const displayCount = selectedStatus
    ? attendeeCount + (selectedStatus ? 1 : 0)
    : attendeeCount;

  return (
    <div className="event-rsvp">
      <div className="event-rsvp-label">
        <span className="event-rsvp-count">{displayCount}</span>
        <span>{displayCount === 1 ? 'person' : 'people'} attending</span>
      </div>

      <div className="event-rsvp-buttons">
        {RSVP_OPTIONS.map((option) => (
          <button
            key={option.status}
            onClick={() => handleRsvp(option.status)}
            disabled={isPastEvent}
            className={cn(
              'event-rsvp-button',
              selectedStatus === option.status && `event-rsvp-button-${option.status}`,
              isPastEvent && 'event-rsvp-button-disabled'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isPastEvent && (
        <p className="event-rsvp-past-notice">
          This event has passed
        </p>
      )}
    </div>
  );
}
