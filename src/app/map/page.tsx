'use client';

import PageHeader from '@/components/sections/PageHeader';
import MapSection from '@/components/sections/MapSection';

/**
 * Dedicated Map page for exploring Coronation Gardens
 * Features an interactive Leaflet map with POIs
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
      <MapSection />
    </div>
  );
}
