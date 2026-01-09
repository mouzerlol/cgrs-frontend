import { Skeleton, SkeletonText } from './Skeleton';
import Card from './Card';

/**
 * Skeleton loader for news cards.
 */
export function NewsCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-48 md:h-56 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-20" />
        <SkeletonText lines={2} />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </div>
    </Card>
  );
}
