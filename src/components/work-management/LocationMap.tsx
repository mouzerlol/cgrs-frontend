'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TaskLocation } from '@/types/work-management';

const DEFAULT_CENTER: [number, number] = [-36.939, 174.787];

interface LocationMapProps {
  location?: TaskLocation;
  onChange: (loc: TaskLocation) => void;
  readonly: boolean;
}

export default function LocationMap({ location, onChange, readonly }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  
  // Use a ref for onChange to avoid stale closures in event listeners without causing re-renders
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!mapRef.current) return;

    let resizeObserver: ResizeObserver | null = null;

    if (!mapInstanceRef.current) {
      const center = location ? [location.lat, location.lng] : DEFAULT_CENTER;
      const map = L.map(mapRef.current).setView(center as L.LatLngExpression, 16);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Fix for grey tile issue when rendered inside modals or hidden containers
      // Trigger multiple times during modal open animation
      [10, 100, 300, 500].forEach(timeout => {
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
      resizeObserver.observe(mapRef.current);

      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });

      if (location) {
        markerRef.current = L.marker([location.lat, location.lng], {
          draggable: !readonly,
          icon
        }).addTo(map);
      }

      if (!readonly) {
        map.on('click', (e) => {
          if (!markerRef.current) {
            markerRef.current = L.marker(e.latlng, { draggable: true, icon }).addTo(map);
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
    }

    return () => {
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

  // Sync marker position when location prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !location) return;

    if (!markerRef.current) {
      const icon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
      });
      
      markerRef.current = L.marker([location.lat, location.lng], {
        draggable: !readonly,
        icon
      }).addTo(mapInstanceRef.current);

      if (!readonly) {
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          onChangeRef.current({ lat: pos.lat, lng: pos.lng });
        });
      }
    } else {
      const currentPos = markerRef.current.getLatLng();
      if (currentPos.lat !== location.lat || currentPos.lng !== location.lng) {
        markerRef.current.setLatLng([location.lat, location.lng]);
      }
    }
  }, [location, readonly]);

  return <div ref={mapRef} className="w-full h-full z-0" />;
}
