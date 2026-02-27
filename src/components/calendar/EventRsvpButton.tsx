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
    <div className="flex flex-col gap-sm p-sm bg-sage-light rounded-xl">
      <div className="flex items-baseline gap-xs text-xs text-forest">
        <span className="font-bold text-base text-forest">{displayCount}</span>
        <span>{displayCount === 1 ? 'person' : 'people'} attending</span>
      </div>

      <div className="flex gap-xs flex-nowrap">
        {RSVP_OPTIONS.map((option) => (
          <button
            key={option.status}
            onClick={() => handleRsvp(option.status)}
            disabled={isPastEvent}
            className={cn(
              'flex-1 py-2 px-3 rounded-md text-xs font-medium cursor-pointer transition-all duration-200 bg-white border border-sage text-forest whitespace-nowrap hover:border-forest hover:bg-sage-light',
              selectedStatus === option.status && option.status === 'attending' && 'bg-forest border-forest text-bone hover:bg-forest-light hover:border-forest-light',
              selectedStatus === option.status && option.status === 'maybe' && 'bg-terracotta border-terracotta text-bone hover:bg-terracotta-dark hover:border-terracotta-dark',
              selectedStatus === option.status && option.status === 'interested' && 'bg-sage border-sage text-forest hover:bg-forest-light hover:border-forest-light hover:text-bone',
              isPastEvent && 'opacity-50 cursor-not-allowed'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {isPastEvent && (
        <p className="text-sm text-forest/60 text-center">
          This event has passed
        </p>
      )}
    </div>
  );
}
