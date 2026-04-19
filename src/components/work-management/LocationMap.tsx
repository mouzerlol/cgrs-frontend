'use client';

import { useRef, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TaskLocation } from '@/types/work-management';
import { MAP_CENTER } from '@/data/map-data';
import {
  getNzWidgetLeafletBasemap,
  addBoundaryLayer,
  fitMapToBoundary,
  BOUNDARY_STYLE_COMPACT,
} from '@/lib/maps';

/** Treat (0,0) as "no location" so we show pin at MAP_CENTER for user to drag. */
function effectivePosition(location?: TaskLocation | null): [number, number] {
  if (!location || (location.lat === 0 && location.lng === 0)) return MAP_CENTER;
  return [location.lat, location.lng];
}

interface LocationMapProps {
  location?: TaskLocation;
  onChange: (loc: TaskLocation) => void;
  readonly: boolean;
}

export default function LocationMap({ location, onChange, readonly }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;

    const init = async () => {
      if (mapInstanceRef.current || !mapRef.current) return;

      const center = effectivePosition(location);
      const nz = getNzWidgetLeafletBasemap();
      const map = L.map(mapRef.current, { maxZoom: 19 }).setView(center as L.LatLngExpression, 16);

      L.tileLayer(nz.tileUrl, { ...nz.tileOptions }).addTo(map);

      if (cancelled) {
        map.remove();
        return;
      }

      addBoundaryLayer(L, map, BOUNDARY_STYLE_COMPACT);
      fitMapToBoundary(L, map, 20);

      mapInstanceRef.current = map;

      [10, 100, 300, 500].forEach((timeout) => {
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, timeout);
      });

      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapRef.current!);

      const markerIcon = L.divIcon({
        className: 'location-map-marker',
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

      const showPin = !readonly || (location && !(location.lat === 0 && location.lng === 0));
      if (showPin) {
        const pos = effectivePosition(location);
        markerRef.current = L.marker(pos, {
          draggable: !readonly,
          icon: markerIcon,
        }).addTo(map);
      }

      if (!readonly) {
        map.on('click', (e) => {
          if (!markerRef.current) {
            markerRef.current = L.marker(e.latlng, { draggable: true, icon: markerIcon }).addTo(map);
            markerRef.current.on('dragend', () => {
              const pos = markerRef.current!.getLatLng();
              onChangeRef.current({ lat: pos.lat, lng: pos.lng });
            });
          } else {
            markerRef.current.setLatLng(e.latlng);
          }
          onChangeRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        if (markerRef.current) {
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng();
            onChangeRef.current({ lat: pos.lat, lng: pos.lng });
          });
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
    // Initialize map only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync marker position when location prop changes (or add marker when location appears in edit mode)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const pos = effectivePosition(location);
    const hasValidLocation = location && !(location.lat === 0 && location.lng === 0);
    const shouldShowPin = !readonly || hasValidLocation;

    const markerIcon = L.divIcon({
      className: 'location-map-marker',
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

    if (!markerRef.current && shouldShowPin) {
      markerRef.current = L.marker(pos, {
        draggable: !readonly,
        icon: markerIcon,
      }).addTo(mapInstanceRef.current);

      if (!readonly) {
        markerRef.current.on('dragend', () => {
          const p = markerRef.current!.getLatLng();
          onChangeRef.current({ lat: p.lat, lng: p.lng });
        });
      }
    } else if (markerRef.current) {
      if (!shouldShowPin) {
        markerRef.current.remove();
        markerRef.current = null;
      } else {
        const currentPos = markerRef.current.getLatLng();
        if (currentPos.lat !== pos[0] || currentPos.lng !== pos[1]) {
          markerRef.current.setLatLng(pos);
        }
      }
    }
  }, [location, readonly]);

  return <div ref={mapRef} className="w-full h-full z-0" />;
}
