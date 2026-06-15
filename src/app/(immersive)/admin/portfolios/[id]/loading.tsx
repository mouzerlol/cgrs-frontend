import { Skeleton } from '@/components/ui/Skeleton';

export default function PortfolioDashboardLoading() {
  return (
    <div className="h-full w-full overflow-hidden flex flex-col bg-bone">
      {/* Nav bar skeleton */}
      <div className="h-14 bg-forest flex items-center px-4 gap-3">
        <Skeleton className="h-4 w-4 rounded !bg-bone/20" />
        <Skeleton className="h-5 w-24 !bg-bone/20" />
        <Skeleton className="h-5 w-40 !bg-bone/20 ml-2" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-24 rounded-lg !bg-bone/20" />
        </div>
      </div>

      <main className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Pegboard grid skeleton — mimics 4-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mission — 2x1 */}
            <div className="lg:col-span-2 rounded-[16px] bg-white border border-sage/20 p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-1" />
            </div>

            {/* People — 2x2 */}
            <div className="lg:col-span-2 row-span-2 rounded-[16px] bg-white border border-sage/20 p-4">
              <Skeleton className="h-4 w-16 mb-4" />
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget — 1x1 */}
            <div className="rounded-[16px] bg-white border border-sage/20 p-4">
              <Skeleton className="h-4 w-16 mb-3" />
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            {/* Services — 2x3 */}
            <div className="lg:col-span-2 rounded-[16px] bg-white border border-sage/20 p-4">
              <Skeleton className="h-4 w-20 mb-3" />
              <div className="space-y-2">
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Work in Flight — 4x2 */}
            <div className="lg:col-span-4 rounded-[16px] bg-white border border-sage/20 p-4">
              <Skeleton className="h-4 w-28 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map(i => (
                  <div key={i}>
                    <Skeleton className="h-8 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
