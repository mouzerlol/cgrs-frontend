'use client';

import { useEffect, useRef } from 'react';
import { BOUNDARY_COORDINATES, MAP_CENTER, MAP_ZOOM } from '@/data/map-data';

interface BoundaryMapProps {
  className?: string;
}

/**
 * Map component with development boundary overlay.
 * Uses Toner base with terracotta boundary styling.
 */
export default function BoundaryMap({ className = '' }: BoundaryMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Check if map is already initialized on this container
      if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        return;
      }

      const map = L.map(mapContainerRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
        preferCanvas: true,
      }).setView(MAP_CENTER, MAP_ZOOM);

      // Base tiles - Stadia Toner Original
      L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', {
        maxZoom: 16,
        crossOrigin: 'anonymous',
      }).addTo(map);

      // Street names labels overlay
      L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 16,
        crossOrigin: 'anonymous',
      }).addTo(map);

      // Development boundary polygon with terracotta styling
      L.geoJSON({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [BOUNDARY_COORDINATES],
        }
      } as GeoJSON.GeoJsonObject, {
        style: {
          color: '#D95D39', // Terracotta - boundary line
          weight: 2,
          fillColor: '#D95D39',
          fillOpacity: 0.12,
        }
      }).addTo(map);

      // Custom marker
      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" style="
          color: #D95D39;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        ">
          <path fill="currentColor" d="M136 127.42V232a8 8 0 0 1-16 0V127.42a56 56 0 1 1 16 0"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48],
      });

      L.marker(MAP_CENTER, { icon: customIcon }).addTo(map);
    };

    initMap();
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '160px',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#eee'
    }}>
      <div 
        ref={mapContainerRef}
        className={className}
        style={{ 
          width: '100%', 
          height: '100%'
        }}
      />
    </div>
  );
}
