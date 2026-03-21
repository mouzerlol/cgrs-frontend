import { Skeleton } from '@/components/ui/Skeleton';

export function EventHeroSkeleton() {
  return (
    <div className="relative w-full min-h-[400px] overflow-hidden bg-forest/20">
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      
      <div className="relative z-[1] p-xl px-md pt-[calc(70px+4rem)] md:pt-[calc(80px+4rem)] max-w-[800px] mx-auto">
        <div className="flex items-center gap-2.5 mb-sm flex-wrap">
          <Skeleton className="h-5 w-32 bg-bone/20" />
          <Skeleton className="h-5 w-24 rounded bg-bone/20" />
        </div>

        <Skeleton className="h-12 w-3/4 max-w-2xl mb-lg bg-bone/20" />
        <Skeleton className="h-12 w-1/2 max-w-xl mb-lg bg-bone/20 md:hidden" />

        <div className="flex flex-col gap-3 mb-lg">
          <Skeleton className="h-5 w-48 bg-bone/20" />
          <Skeleton className="h-5 w-32 bg-bone/20" />
          <Skeleton className="h-5 w-64 bg-bone/20" />
        </div>

        <Skeleton className="h-12 w-48 rounded-lg bg-bone/20" />
      </div>
    </div>
  );
}

export default EventHeroSkeleton;
