'use client';

import { cn } from '@/lib/utils';

interface MapSkeletonProps {
  className?: string;
  showSidebar?: boolean;
}

/**
 * Skeleton loading component for map sections.
 * Provides visual feedback while the map and POI data load.
 * Matches the layout of MapSection for seamless transition.
 */
export default function MapSkeleton({ className, showSidebar = true }: MapSkeletonProps) {
  return (
    <section className={cn('map-section relative', className)}>
      {/* Sidebar Skeleton */}
      {showSidebar && (
        <div className="poi-sidebar animate-pulse">
          <div className="sidebar-header">
            <div className="h-6 w-32 bg-forest/20 rounded" />
            <div className="h-4 w-24 bg-forest/10 rounded mt-2" />
          </div>

          {/* POI Group Skeletons */}
          {[1, 2, 3].map((group) => (
            <div key={group} className="poi-group">
              <div className="poi-group-header">
                <div className="h-3 w-3 bg-sage/40 rounded-full" />
                <div className="h-4 w-20 bg-forest/15 rounded" />
              </div>
              <ul className="poi-list">
                {[1, 2, 3].map((item) => (
                  <li key={item}>
                    <div className="h-8 w-full bg-forest/10 rounded" />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Map Container Skeleton */}
      <div
        className="map-container animate-pulse"
        style={{
          background: 'linear-gradient(135deg, #f5f5f5 0%, #e8ede6 100%)',
          minHeight: '500px',
          marginLeft: showSidebar ? '280px' : 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-sage/30 border-t-terracotta rounded-full animate-spin mx-auto" />
          <div className="h-4 w-32 bg-forest/20 rounded mt-4 mx-auto" />
        </div>
      </div>

      {/* Legend Skeleton */}
      <div
        className="map-legend animate-pulse"
        style={{ marginLeft: showSidebar ? '280px' : 0 }}
      >
        <div className="h-5 w-16 bg-forest/20 rounded mb-3" />
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <div className="h-3 w-3 bg-sage/40 rounded-full" />
              <div className="h-3 w-16 bg-forest/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
