import { Skeleton } from '@/components/ui/Skeleton';

export default function WorkManagementLoading() {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      {/* Nav bar skeleton */}
      <div className="h-14 bg-forest flex items-center px-4">
        <Skeleton className="h-5 w-40 !bg-bone/20" />
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-8 lg:p-12">
          {/* Header skeleton */}
          <div className="bg-sage-light/50 rounded-[20px] p-6 md:p-8 mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>

          {/* Feature cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-[20px] p-6 border border-sage/20 bg-sage-light/30">
                <div className="flex items-start justify-between mb-5">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
