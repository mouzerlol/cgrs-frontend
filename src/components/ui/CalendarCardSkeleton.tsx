import { Skeleton } from './Skeleton';

/**
 * Skeleton loader for calendar/event cards with image and date badge.
 */
export function CalendarCardSkeleton() {
  return (
    <article className="calendar-card fade-up">
      <div className="calendar-image-wrapper relative h-[200px] overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="calendar-date-badge absolute top-4 right-4">
          <Skeleton className="h-14 w-12 rounded-lg" />
        </div>
      </div>
      <div className="calendar-content p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </article>
  );
}
