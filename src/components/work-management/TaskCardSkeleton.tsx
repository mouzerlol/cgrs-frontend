import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton loader for TaskCard component.
 * Matches the structure: title (2 lines), tags row, footer (avatar, icons, date).
 */
export default function TaskCardSkeleton() {
  return (
    <div className="w-full bg-white/80 shadow-sm border border-sage/20 overflow-hidden flex flex-col">
      <div className="p-3 flex-1 flex flex-col gap-3 min-w-0 w-full">
        {/* Title lines */}
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Tags row */}
        <div className="flex flex-wrap gap-1.5">
          <Skeleton className="h-5 w-12 rounded-sm" />
          <Skeleton className="h-5 w-16 rounded-sm" />
          <Skeleton className="h-5 w-10 rounded-sm" />
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-auto pt-1 w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-3.5 h-3.5 rounded" />
            <Skeleton className="w-4 h-3.5 rounded" />
          </div>
          <Skeleton className="w-10 h-3 rounded" />
        </div>
      </div>
    </div>
  );
}
