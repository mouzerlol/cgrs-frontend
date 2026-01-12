'use client';

import { useEffect, useRef } from 'react';

interface MapMarkerProps {
  map: L.Map | null;
  position: [number, number];
  color?: string;
  size?: number;
  iconAnchor?: [number, number];
  popupAnchor?: [number, number];
  popup?: string;
  zIndexOffset?: number;
  onClick?: () => void;
  onCreate?: (marker: L.Marker) => void;
}

/**
 * Reusable map marker component using SVG icons.
 * Creates a circle marker with customizable color and size.
 */
export default function MapMarker({
  map,
  position,
  color = '#D95D39',
  size = 24,
  iconAnchor,
  popupAnchor,
  popup,
  zIndexOffset,
  onClick,
  onCreate,
}: MapMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    (async () => {
      const L = (await import('leaflet')).default;

      const anchor = iconAnchor ?? [size / 2, size / 2];
      const anchorPopup = popupAnchor ?? [0, -size / 2];

      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="
          color: ${color};
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
        iconSize: [size, size],
        iconAnchor: anchor,
        popupAnchor: anchorPopup,
      });

      markerRef.current = L.marker(position, { icon, zIndexOffset });

      if (popup) {
        markerRef.current.bindPopup(popup, {
          className: 'custom-popup',
        });
      }

      if (onClick) {
        markerRef.current.on('click', onClick);
      }

      markerRef.current.addTo(map);

      if (onCreate) {
        onCreate(markerRef.current);
      }
    })();

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, color, size, iconAnchor, popupAnchor, popup, zIndexOffset, onClick, onCreate]);

  return null;
}
