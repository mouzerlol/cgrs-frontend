import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Skeleton loader for TaskDetailModal.
 * Matches the two-column layout: header, main content, and sidebar.
 */
export default function TaskDetailSkeleton() {
  return (
    <div className="h-full flex flex-col bg-sage-light/50 animate-pulse">
      {/* Header */}
      <div className="p-5 pb-4 bg-forest-light border-b border-sage/10">
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-6 w-20 rounded-full" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <Skeleton className="h-3 w-32" />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-8 w-full max-w-md" />
        </div>

        <div className="flex flex-wrap gap-6 items-center text-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-40 rounded-full" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="space-y-5">
          {/* Description Section */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-24" />
            <div className="bg-white rounded-[20px] p-4 border border-sage/20">
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          </div>

          {/* Assignee + Labels / Location */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <div className="bg-white rounded-[20px] p-3 border border-sage/20">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-20" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Skeleton className="h-3 w-16" />
                <div className="bg-white rounded-[20px] p-3 min-h-[58px] border border-sage/20">
                  <div className="flex flex-wrap gap-1.5">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-[180px] w-full rounded-2xl border border-sage/20" />
            </div>
          </div>

          {/* Assets */}
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-16" />
            <div className="bg-white rounded-[20px] p-3 border border-sage/20">
              <div className="flex gap-2">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <Skeleton className="h-20 w-20 rounded-xl" />
                <Skeleton className="h-20 w-20 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Comments & Activity Tabs */}
          <div className="bg-white rounded-[24px] overflow-hidden shadow-lg border border-sage/10">
            <div className="flex border-b border-sage/5 bg-bone/30 p-1 gap-1">
              <Skeleton className="h-8 w-28 rounded-xl" />
              <Skeleton className="h-8 w-20 rounded-xl" />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2 w-14" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
