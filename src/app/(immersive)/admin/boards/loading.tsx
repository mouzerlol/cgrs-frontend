import { Skeleton } from '@/components/ui/Skeleton';

export default function BoardsLoading() {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      {/* Nav bar skeleton */}
      <div className="h-14 bg-forest flex items-center px-4 gap-3">
        <Skeleton className="h-4 w-4 rounded !bg-bone/20" />
        <Skeleton className="h-5 w-24 !bg-bone/20" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-28 rounded-lg !bg-bone/20" />
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[20px] p-5 border border-sage/20 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="w-3 h-10 rounded-full" />
                  <Skeleton className="h-5 w-36" />
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
