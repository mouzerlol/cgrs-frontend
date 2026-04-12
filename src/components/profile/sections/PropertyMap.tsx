'use client';

import { useRef, useCallback } from 'react';
import { BOUNDARY_COORDINATES } from '@/data/map-data';
import BaseMap from '@/components/map/BaseMap';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';

interface PropertyMapProps {
  lat: number | null;
  lng: number | null;
  address: string;
  className?: string;
}

/**
 * Static Leaflet map showing a property location with a pin.
 * Uses community boundary and max-zooms to show the pin clearly.
 * No user interaction (no dragging/zooming).
 */
export default function PropertyMap({ lat, lng, address, className }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleMapReady = useCallback(async (map: L.Map) => {
    mapRef.current = map;

    const L = (await import('leaflet')).default;

    // Add boundary polygon
    L.geoJSON({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [BOUNDARY_COORDINATES],
      },
    } as GeoJSON.GeoJsonObject, {
      style: {
        color: '#D95D39',
        weight: 2,
        fillColor: '#D95D39',
        fillOpacity: 0.12,
      },
    }).addTo(map);

    // Create custom terracotta marker icon
    const iconHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 30" style="
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 18 12 18s12-10 12-18c0-6.627-5.373-12-12-12z" fill="#D95D39"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
      </svg>
    `;

    const icon = L.divIcon({
      className: 'property-marker',
      html: iconHtml,
      iconSize: [32, 40],
      iconAnchor: [16, 40],
      popupAnchor: [0, -40],
    });

    // If we have valid coordinates, add marker and fit bounds
    if (lat !== null && lng !== null) {
      // Clean up any existing marker
      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = L.marker([lat, lng], {
        icon,
        zIndexOffset: 1000,
      }).addTo(map);

      // When property coordinates exist, set view tightly on the property pin
      map.setView([lat, lng], 19);
    } else {
      // Fallback: center on community and zoom to boundary
      map.setView([-36.9497, 174.7912], 16);
      map.fitBounds(
        L.latLngBounds(
          BOUNDARY_COORDINATES.map(([lng, lat]) => [lat, lng] as [number, number])
        ),
        { padding: [20, 20] }
      );
    }
  }, [lat, lng]);

  const tileUrl = getOSMTileUrl();
  const tileOptions = getOSMTileOptions();

  return (
    <div
      className={`relative w-full h-[200px] overflow-hidden bg-forest ${className ?? ''}`}
    >
      <BaseMap
        center={lat !== null && lng !== null ? [lat, lng] : [-36.9497, 174.7912]}
        zoom={lat !== null && lng !== null ? 19 : 16}
        maxZoom={19}
        tileUrl={tileUrl}
        tileOptions={tileOptions}
        zoomControl={false}
        showHomeControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        preferCanvas={true}
        onMapReady={handleMapReady}
      />

      {/* Address label overlay */}
      <div className="absolute bottom-sm left-sm right-sm flex items-center gap-xs p-sm px-md bg-forest/90 backdrop-blur-sm rounded-lg text-bone text-sm z-[1000] truncate">
        <span className="shrink-0 text-terracotta">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </span>
        <span className="font-medium truncate">{address}</span>
      </div>
    </div>
  );
}
