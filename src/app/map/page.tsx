'use client';

import { Suspense } from 'react';
import PageHeader from '@/components/sections/PageHeader';
import MapSection from '@/components/sections/MapSection';
import MapSkeleton from '@/components/map/MapSkeleton';

/**
 * Dedicated Map page for exploring Coronation Gardens
 * Features an interactive Leaflet map with POIs
 *
 * Uses Suspense boundary to enable streaming and show a skeleton
 * while the MapSection component and its data load.
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
