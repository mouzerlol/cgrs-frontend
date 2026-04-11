import { Skeleton } from '@/components/ui/Skeleton';
import TaskCardSkeleton from './TaskCardSkeleton';

/**
 * Skeleton loader for BoardColumn component.
 * Matches the structure: header (title + count), task list, add button.
 */
export default function BoardColumnSkeleton() {
  return (
    <div className="bg-sage-lite/60 backdrop-blur-xl border border-sage/30 shadow-sm w-[280px] min-w-[280px] flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-3 flex items-center justify-between shrink-0 border-b border-sage/10">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-6 rounded-full" />
      </div>

      {/* Task cards */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin min-h-[2px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>

      {/* Add card button */}
      <div className="p-2 shrink-0 border-t border-sage/10">
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
