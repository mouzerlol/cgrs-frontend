'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import PageHeader from '@/components/sections/PageHeader';
import MapSkeleton from '@/components/map/MapSkeleton';

const MapSection = dynamic(() => import('@/components/sections/MapSection'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

/**
 * Dedicated Map page for exploring Coronation Gardens
 * Features an interactive Leaflet map with POIs
 *
 * The MapSection component handles scrolling to show the map below
 * the fixed header via useImmersiveScroll with scrollOnMount: true.
 * This is an intentional exception to the global scroll-to-top behavior.
 */
export default function MapPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Explore Coronation Gardens"
        description="Community boundaries, amenities, and points of interest in Māngere Bridge."
        eyebrow="Community Map"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <Suspense fallback={<MapSkeleton />}>
        <MapSection />
      </Suspense>
    </div>
  );
}
