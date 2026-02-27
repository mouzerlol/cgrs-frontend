'use client';

import Image from 'next/image';
import { Event, CalendarItem } from '@/types';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

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
      className={cn(
        'group rounded-card bg-bone border border-sage-light overflow-hidden shadow-sm transition-all duration-[200ms] ease-out-custom',
        'hover:-translate-y-1 hover:shadow-card-hover',
        onClick && 'cursor-pointer',
        'fade-up',
        isVisible && 'visible'
      )}
      {...articleProps}
    >
      <div className="relative h-[200px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-[200ms] ease-out-custom group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute top-4 right-4 flex flex-col items-center justify-center bg-terracotta text-bone rounded-lg w-12 h-14 shadow-md">
          <span className="font-display text-lg font-bold leading-none">{day}</span>
          <span className="text-[0.65rem] uppercase tracking-wider leading-none mt-0.5">{month}</span>
        </div>
      </div>

      <div className="p-md space-y-2">
        <h3 className="font-display text-lg font-medium text-forest leading-snug">{event.title}</h3>
        <p className="text-sm text-forest/70 line-clamp-2">{event.description}</p>
        <div className="flex items-center gap-3 text-xs text-forest/60 pt-1">
          <span>{time}</span>
          {showLocation && location && <span>{location}</span>}
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
