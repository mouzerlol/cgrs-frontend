'use client';

import PageHeader from '@/components/sections/PageHeader';
import InteractiveMap from '@/components/map/InteractiveMap';

/**
 * Dedicated Map page for exploring Coronation Gardens
 * Features an interactive Leaflet map with full controls, boundary highlighting, and POIs
 */
export default function MapPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Explore Coronation Gardens"
        description="View our community boundaries, nearby amenities, and points of interest in the heart of Māngere Bridge."
        eyebrow="Community Map"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <InteractiveMap />
    </div>
  );
}
