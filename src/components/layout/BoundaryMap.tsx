'use client';

import { useRef } from 'react';
import { MAP_CENTER, MAP_ZOOM } from '@/data/map-data';
import BaseMap from '@/components/map/BaseMap';
import MapMarker from '@/components/map/MapMarker';
import {
  getNzWidgetLeafletBasemap,
  addBoundaryLayer,
  BOUNDARY_STYLE_COMPACT,
} from '@/lib/maps';

interface BoundaryMapProps {
  className?: string;
  height?: string;
}

/**
 * Map component with development boundary overlay.
 * Uses LINZ topographic vector when configured, else OSM Standard.
 * Wraps BaseMap for consistent initialization.
 */
export default function BoundaryMap({ className = '', height = '160px' }: BoundaryMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;

    // Add boundary polygon
    (async () => {
      const L = (await import('leaflet')).default;
      addBoundaryLayer(L, map, BOUNDARY_STYLE_COMPACT);
    })();
  };

  const nzBasemap = getNzWidgetLeafletBasemap();

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      <BaseMap
        className={className}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        tileUrl={nzBasemap.tileUrl}
        tileOptions={nzBasemap.tileOptions}
        maxZoom={nzBasemap.tileOptions.maxZoom}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={true}
        preferCanvas={true}
        onMapReady={handleMapReady}
      >
        <MapMarker
          map={mapRef.current}
          position={MAP_CENTER}
          color="#D95D39"
          size={32}
          iconAnchor={[16, 48]}
          popupAnchor={[0, -48]}
        />
      </BaseMap>
    </div>
  );
}
