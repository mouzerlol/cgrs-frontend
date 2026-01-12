'use client';

import { useRef, useEffect, useCallback } from 'react';
import { BOUNDARY_COORDINATES } from '@/data/map-data';
import BaseMap from '@/components/map/BaseMap';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';

interface FooterMapProps {
  className?: string;
}

/**
 * Interactive Leaflet map component for footer location display.
 * Uses OSM tiles with boundary overlay.
 * Wraps BaseMap for consistent initialization.
 */
export default function FooterMap({ className }: FooterMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingLink = document.querySelector('link[href*="leaflet"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

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

    // Clean up any existing marker
    if (markerRef.current) {
      markerRef.current.remove();
    }

    const iconHtml = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" style="
        color: #D95D39;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.9"/>
        <circle cx="12" cy="12" r="5" fill="white"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
      </svg>
    `;

    const icon = L.divIcon({
      className: 'custom-marker',
      html: iconHtml,
      iconSize: [32, 32],
      iconAnchor: [16, 48],
      popupAnchor: [0, -48],
    });

    markerRef.current = L.marker([-36.9497, 174.7912], {
      icon,
      zIndexOffset: 1000
    }).addTo(map);
  }, []);

  const tileUrl = getOSMTileUrl();
  const tileOptions = getOSMTileOptions();

  return (
    <div
      data-testid="footer-map-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '160px',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#1A2218',
      }}
    >
      <BaseMap
        className={className}
        center={[-36.9497, 174.7912]}
        zoom={16}
        tileUrl={tileUrl}
        tileOptions={tileOptions}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={false}
        preferCanvas={true}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
