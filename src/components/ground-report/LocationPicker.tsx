'use client';

/**
 * A small Leaflet map for the ground-report image capture flow. Click (or drag the
 * pin) to set a coordinate; the chosen lat/lng is reported up via `onPick`. Reuses
 * the OSM tiles + community centre from the main map. The manual-pin backstop in the
 * device → EXIF → manual capture chain (a pin is required before an image can save).
 */

import { useEffect, useRef } from 'react';
import BaseMap from '@/components/map/BaseMap';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';
import { MAP_CENTER, MAP_ZOOM } from '@/data/map-data';

export interface LatLng {
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: LatLng | null;
  onPick: (coord: LatLng) => void;
  className?: string;
}

export default function LocationPicker({ value, onPick, className }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);
  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  const placeOrMove = async (coord: LatLng) => {
    const map = mapRef.current;
    if (!map) return;
    const L = (await import('leaflet')).default;
    if (!markerRef.current) {
      // Custom divIcon: Leaflet's default PNG marker asset does not resolve under
      // the bundler, so every map in this app uses an inline SVG pin instead.
      const icon = L.divIcon({
        className: '',
        html:
          '<svg width="28" height="28" viewBox="0 0 24 24" fill="#D95D39" stroke="#F4F1EA" stroke-width="2" style="filter:drop-shadow(0 2px 3px rgba(26,34,24,0.4))"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#F4F1EA" stroke="none"/></svg>',
        iconSize: [28, 28],
        iconAnchor: [14, 26],
      });
      markerRef.current = L.marker([coord.lat, coord.lng], { draggable: true, icon }).addTo(map);
      markerRef.current.on('dragend', () => {
        const ll = markerRef.current!.getLatLng();
        onPickRef.current({ lat: ll.lat, lng: ll.lng });
      });
    } else {
      markerRef.current.setLatLng([coord.lat, coord.lng]);
    }
  };

  // Reflect an externally-supplied coordinate (device / EXIF) onto the map.
  useEffect(() => {
    if (value) {
      placeOrMove(value);
      mapRef.current?.panTo([value.lat, value.lng]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    map.on('click', (e: L.LeafletMouseEvent) => {
      const coord = { lat: e.latlng.lat, lng: e.latlng.lng };
      placeOrMove(coord);
      onPickRef.current(coord);
    });
    if (value) placeOrMove(value);
  };

  return (
    <div className={className} style={{ height: 240 }} data-testid="location-picker">
      <BaseMap
        center={value ? [value.lat, value.lng] : MAP_CENTER}
        zoom={MAP_ZOOM - 1}
        tileUrl={getOSMTileUrl()}
        tileOptions={getOSMTileOptions()}
        showHomeControl={false}
        scrollWheelZoom
        maxZoom={20}
        minZoom={12}
        onMapReady={handleMapReady}
      />
    </div>
  );
}
