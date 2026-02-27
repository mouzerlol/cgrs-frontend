import { Skeleton } from './Skeleton';

/**
 * Skeleton loader for calendar/event cards with image and date badge.
 */
export function CalendarCardSkeleton() {
  return (
    <article className="rounded-card bg-bone border border-sage-light overflow-hidden shadow-sm">
      <div className="relative h-[200px] overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute top-4 right-4">
          <Skeleton className="h-14 w-12 rounded-lg" />
        </div>
      </div>
      <div className="p-md space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </article>
  );
}
