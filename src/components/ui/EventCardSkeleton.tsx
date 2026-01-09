import { Skeleton, SkeletonText } from './Skeleton';
import Card from './Card';

/**
 * Skeleton loader for event cards.
 */
export function EventCardSkeleton() {
  return (
    <Card className="h-full flex flex-col p-6">
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-16 w-16 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} className="mb-4 flex-1" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </Card>
  );
}
