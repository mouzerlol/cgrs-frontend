'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { Map as MapIcon } from 'lucide-react';
import { BOUNDARY_COORDINATES } from '@/data/map-data';
import BaseMap from '@/components/map/BaseMap';
import { getNzWidgetLeafletBasemap } from '@/lib/maps';

interface PropertyMapProps {
  lat: number | null;
  lng: number | null;
  address: string;
  className?: string;
}

/** Keyframes + pin styling, injected once and shared across every map instance. */
const PIN_STYLES = `
.cgrs-pin { position: relative; width: 40px; height: 52px; }
.cgrs-pin__marker {
  position: relative; display: block; width: 40px; height: 52px; z-index: 2;
  filter: drop-shadow(0 4px 5px rgba(26,34,24,0.35));
}
.cgrs-pin__ground {
  position: absolute; left: 50%; top: 47px; width: 18px; height: 7px; z-index: 1;
  transform: translate(-50%, -50%);
  background: radial-gradient(ellipse at center, rgba(26,34,24,0.32), transparent 70%);
}
.cgrs-pin__pulse {
  position: absolute; left: 50%; top: 48px; width: 44px; height: 44px;
  margin: -22px 0 0 -22px; border-radius: 9999px; z-index: 0;
  background: rgba(217,93,57,0.35);
  animation: cgrsPinPulse 2400ms cubic-bezier(0.22, 1, 0.36, 1) infinite;
}
@keyframes cgrsPinPulse {
  0%   { transform: scale(0.28); opacity: 0.6; }
  70%  { opacity: 0; }
  100% { transform: scale(2.2); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .cgrs-pin__pulse { animation: none; opacity: 0; }
}
`;

const PIN_SVG = `
  <svg class="cgrs-pin__marker" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" fill="none">
    <path d="M20 2C11.2 2 4 9.05 4 17.8 4 29.9 20 50 20 50s16-20.1 16-32.2C36 9.05 28.8 2 20 2Z" fill="#D95D39"/>
    <path d="M20 2C11.2 2 4 9.05 4 17.8 4 29.9 20 50 20 50s16-20.1 16-32.2C36 9.05 28.8 2 20 2Z" stroke="#C74E2E" stroke-width="1"/>
    <circle cx="20" cy="18" r="6.5" fill="#FAF8F3"/>
  </svg>
`;

/**
 * Static Leaflet map showing a single property location, fully zoomed and
 * centred on a refined animated pin. No user interaction, no overlay card:
 * the address lives in the surrounding heading, not on the map.
 */
export default function PropertyMap({ lat, lng, address, className }: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleMapReady = useCallback(async (map: L.Map) => {
    mapRef.current = map;

    const L = (await import('leaflet')).default;

    const icon = L.divIcon({
      className: 'property-marker',
      html: `<div class="cgrs-pin"><span class="cgrs-pin__pulse"></span><span class="cgrs-pin__ground"></span>${PIN_SVG}</div>`,
      iconSize: [40, 52],
      iconAnchor: [20, 48],
      popupAnchor: [0, -44],
    });

    if (lat !== null && lng !== null) {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      markerRef.current = L.marker([lat, lng], { icon, zIndexOffset: 1000 }).addTo(map);
      map.setView([lat, lng], 19);
    } else {
      // No coordinates: fall back to the community boundary so the card still reads.
      L.geoJSON(
        {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [BOUNDARY_COORDINATES] },
        } as GeoJSON.GeoJsonObject,
        { style: { color: '#D95D39', weight: 2, fillColor: '#D95D39', fillOpacity: 0.12 } },
      ).addTo(map);

      map.setView([-36.9497, 174.7912], 16);
      map.fitBounds(
        L.latLngBounds(BOUNDARY_COORDINATES.map(([lng, lat]) => [lat, lng] as [number, number])),
        { padding: [24, 24] },
      );
    }
  }, [lat, lng]);

  const nzBasemap = getNzWidgetLeafletBasemap();
  const hasCoords = lat !== null && lng !== null;

  return (
    <div
      data-testid="property-map"
      className={`relative w-full h-[240px] sm:h-[300px] md:h-[340px] overflow-hidden bg-forest ${className ?? ''}`}
    >
      <style suppressHydrationWarning>{PIN_STYLES}</style>

      <BaseMap
        center={hasCoords ? [lat, lng] : [-36.9497, 174.7912]}
        zoom={hasCoords ? 19 : 16}
        tileUrl={nzBasemap.tileUrl}
        tileOptions={nzBasemap.tileOptions}
        maxZoom={nzBasemap.tileOptions.maxZoom}
        zoomControl={false}
        showHomeControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        boxZoom={false}
        keyboard={false}
        attributionControl={true}
        preferCanvas={true}
        onMapReady={handleMapReady}
      />

      {/* Depth: a soft inner vignette so the map sits into the card rather than floating flat. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[900] shadow-[inset_0_0_0_1px_rgba(26,34,24,0.08),inset_0_-40px_64px_-32px_rgba(26,34,24,0.45)]"
      />

      {/* The whole map is a doorway to the full community map. On hover it dims
          and invites; on tap it just navigates. */}
      <Link
        href="/map"
        aria-label={`Explore the neighbourhood around ${address} on the community map`}
        className="group absolute inset-0 z-[950] block"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-forest/0 transition-colors duration-300 ease-out group-hover:bg-forest/40 group-focus-visible:bg-forest/40 motion-reduce:transition-none"
        />
        <span
          aria-hidden="true"
          className="absolute right-3 top-3 flex translate-y-[-3px] items-center gap-1.5 bg-bone/95 px-3 py-1.5 text-sm font-medium text-forest opacity-0 shadow-[0_4px_16px_rgba(26,34,24,0.25)] transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none"
        >
          <MapIcon className="h-4 w-4 text-terracotta" />
          Explore the neighbourhood
        </span>
      </Link>

      <span className="sr-only">Map showing the location of {address}</span>
    </div>
  );
}
