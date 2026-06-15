import { Skeleton } from '@/components/ui/Skeleton';

export default function PortfoliosLoading() {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      {/* Nav bar skeleton */}
      <div className="h-14 bg-forest flex items-center px-4 gap-3">
        <Skeleton className="h-4 w-4 rounded !bg-bone/20" />
        <Skeleton className="h-5 w-32 !bg-bone/20" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-28 rounded-lg !bg-bone/20" />
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[20px] p-5 border border-sage/20 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <Skeleton className="w-10 h-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
