import { Skeleton } from '@/components/ui/Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-3 text-center sm:text-left">
            <Skeleton className="mx-auto h-8 w-48 rounded sm:mx-0" />
            <Skeleton className="mx-auto h-4 w-32 rounded sm:mx-0" />
            <Skeleton className="mx-auto mt-2 h-6 w-24 rounded-full sm:mx-0" />
          </div>
        </div>
      </div>

      {/* Nav + content skeleton */}
      <div className="mt-6 lg:flex lg:gap-6">
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="space-y-2 rounded-card bg-white p-3 shadow-sm">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <Skeleton className="h-48 w-full rounded-card bg-white shadow-sm" />
          <Skeleton className="h-40 w-full rounded-card bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
