import { EventHeroSkeleton } from '@/components/event/EventHeroSkeleton';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EventLoading() {
  return (
    <div className="min-h-screen">
      <EventHeroSkeleton />

      <div className="p-lg px-md" style={{ containerType: 'inline-size', containerName: 'event-content' }}>
        <div className="event-content-grid grid grid-cols-1 gap-lg max-w-[1200px] mx-auto">
          <div className="min-w-0">
            <section className="mb-xl space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </section>
            
            <section className="mb-xl">
              <Skeleton className="h-[300px] w-full rounded-xl" />
            </section>
          </div>

          <aside className="event-content-sidebar flex flex-col gap-lg">
            <Skeleton className="h-[350px] w-full rounded-xl" />
            <Skeleton className="h-[120px] w-full rounded-xl" />
          </aside>
        </div>
      </div>

      <style>{`
        @container event-content (min-width: 900px) {
          .event-content-grid {
            grid-template-columns: 1fr 280px;
            align-items: start;
          }
          .event-content-sidebar {
            position: sticky;
            top: 100px;
          }
        }
      `}</style>
    </div>
  );
}
