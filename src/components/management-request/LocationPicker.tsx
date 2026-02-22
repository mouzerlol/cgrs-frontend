'use client';

import { useRef, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { RequestLocation } from '@/types/management-request';
import { MAP_CENTER, BOUNDARY_COORDINATES } from '@/data/map-data';
import { formatCoordinates } from '@/lib/management-request';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';

interface LocationPickerProps {
  value: RequestLocation | null;
  onChange: (location: RequestLocation | null) => void;
  className?: string;
}

/**
 * Interactive location picker with a draggable map pin.
 * Extends the map functionality to allow residents to pinpoint issue locations.
 * Automatically zooms to fit the community boundary.
 */
export function LocationPicker({
  value,
  onChange,
  className,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const initializedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const defaultLocation: RequestLocation = {
    lat: MAP_CENTER[0],
    lng: MAP_CENTER[1],
  };

  const currentLocation = value || defaultLocation;

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const initMap = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        const Leaflet = await import('leaflet');
        const L = Leaflet.default;

        // Fix default icon issue
        delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        if (!containerRef.current) return;

        // Create map without initial view - we'll set it with fitBounds
        const map = L.map(containerRef.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          dragging: true,
          attributionControl: false,
        });

        // Add tile layer (same OSM set as map page and footer)
        const osmUrl = getOSMTileUrl();
        const osmOpts = getOSMTileOptions();
        L.tileLayer(osmUrl, osmOpts).addTo(map);

        // Add boundary polygon
        const boundaryCoords = BOUNDARY_COORDINATES.map(
          ([lng, lat]) => [lat, lng] as L.LatLngTuple
        );
        const boundaryPolygon = L.polygon(boundaryCoords, {
          color: '#D95D39',
          weight: 2,
          fillColor: '#D95D39',
          fillOpacity: 0.1,
        }).addTo(map);

        // Fit map to boundary with minimal padding for maximum zoom
        map.fitBounds(boundaryPolygon.getBounds(), {
          padding: [8, 8],
        });

        // Create custom terracotta marker icon
        const markerIcon = L.divIcon({
          className: 'location-picker-marker',
          html: `
            <div class="location-marker-pin">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 24 30">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 18 12 18s12-10 12-18c0-6.627-5.373-12-12-12z" fill="#D95D39"/>
                <circle cx="12" cy="12" r="5" fill="white"/>
              </svg>
            </div>
          `,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
        });

        // Add draggable marker
        const marker = L.marker([currentLocation.lat, currentLocation.lng], {
          draggable: true,
          icon: markerIcon,
        }).addTo(map);

        // Handle drag end
        marker.on('dragend', () => {
          const position = marker.getLatLng();
          onChange({
            lat: position.lat,
            lng: position.lng,
          });
        });

        mapRef.current = map;
        markerRef.current = marker;
        setIsLoaded(true);

        // Invalidate size after render
        setTimeout(() => map.invalidateSize(), 100);
      } catch (error) {
        console.error('Error initializing location picker:', error);
        initializedRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        initializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker position when value changes externally
  useEffect(() => {
    if (markerRef.current && value) {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== value.lat || currentPos.lng !== value.lng) {
        markerRef.current.setLatLng([value.lat, value.lng]);
      }
    }
  }, [value]);

  return (
    <div className={cn('location-picker', className)}>
      <label className="location-picker-label">
        <span className="text-sm font-medium mb-2 block">
          Location <span className="text-sage opacity-60">(optional)</span>
        </span>
        <span className="text-xs opacity-60 mb-3 block">
          Drag the pin to mark the issue location
        </span>
      </label>

      <div className="location-picker-map-container">
        <div
          ref={containerRef}
          className="location-picker-map"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {!isLoaded && (
          <div className="location-picker-loading">
            <Icon icon="lucide:loader-2" className="animate-spin" width={24} height={24} />
            <span className="text-sm opacity-60">Loading map...</span>
          </div>
        )}
      </div>

      <div className="location-picker-footer">
        <div className="location-picker-coords">
          <Icon icon="lucide:map-pin" width={14} height={14} className="text-terracotta" />
          <span className="text-xs font-mono opacity-70">
            {formatCoordinates(currentLocation.lat, currentLocation.lng)}
          </span>
        </div>
      </div>
    </div>
  );
}
