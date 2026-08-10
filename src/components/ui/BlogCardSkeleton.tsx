import { Skeleton, SkeletonText } from './Skeleton';

/**
 * Skeleton loader for a blog cell.
 *
 * Shaped to `BlogPostCell`'s `home` variant rather than to a generic card: a
 * plate running to the card's own edges, a short category label, a two-line
 * title box, three lines of excerpt, and the record band welded to the bottom.
 * A placeholder that does not have the real thing's proportions moves the page
 * when the content lands.
 */
export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-sage/40 bg-white">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />

      <div className="space-y-3 p-4">
        <Skeleton className="h-2.5 w-16" />
        <SkeletonText lines={2} />
        <SkeletonText lines={3} />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-bone-edge px-4 py-2.5">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-2.5 w-24" />
      </div>
    </div>
  );
}
