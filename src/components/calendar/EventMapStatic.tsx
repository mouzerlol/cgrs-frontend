'use client';

import { useRef, useCallback, useEffect, useState } from 'react';
import BaseMap from '@/components/map/BaseMap';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';
import { BOUNDARY_COORDINATES } from '@/data/map-data';

const CGRS_CENTER: [number, number] = [-36.9497, 174.7912];

interface EventMapStaticProps {
  destination?: {
    lat: number;
    lng: number;
    label: string;
  } | null;
  showBoundary?: boolean;
}

export default function EventMapStatic({
  destination,
  showBoundary = true,
}: EventMapStaticProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleMapReady = useCallback(async (map: L.Map) => {
    mapRef.current = map;
    const L = (await import('leaflet')).default;

    const tileUrl = getOSMTileUrl();
    const tileOptions = getOSMTileOptions();

    L.tileLayer(tileUrl, {
      maxZoom: tileOptions.maxZoom ?? 19,
      attribution: tileOptions.attribution,
    }).addTo(map);

    if (showBoundary) {
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

    if (destination) {
      const destinationIconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" style="
          color: #1A2218;
        ">
          <path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      const destinationIcon = L.divIcon({
        className: 'destination-marker',
        html: destinationIconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      L.marker([destination.lat, destination.lng], {
        icon: destinationIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      L.marker(CGRS_CENTER, {
        icon,
        zIndexOffset: 1000,
      }).addTo(map);

      routeRef.current = L.polyline([CGRS_CENTER, [destination.lat, destination.lng]], {
        color: '#D95D39',
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 4',
      }).addTo(map);

      const bounds = L.latLngBounds([CGRS_CENTER, [destination.lat, destination.lng]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      markerRef.current = L.marker(CGRS_CENTER, {
        icon,
        zIndexOffset: 1000,
      }).addTo(map);

      map.setView(CGRS_CENTER, 16);
    }

    setIsLoaded(true);
  }, [destination, showBoundary]);

  if (!destination && !showBoundary) {
    return null;
  }

  return (
    <div
      className="event-map-static"
      style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#1A2218',
      }}
    >
      <BaseMap
        center={CGRS_CENTER}
        zoom={16}
        tileUrl={getOSMTileUrl()}
        tileOptions={getOSMTileOptions()}
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

      {destination && (
        <div className="event-map-label">
          <span className="event-map-label-icon">📍</span>
          <span className="event-map-label-text">{destination.label}</span>
        </div>
      )}
    </div>
  );
}
