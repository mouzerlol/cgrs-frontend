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
  popupDescription?: string;
  popupType?: { label: string; color: string };
  zIndexOffset?: number;
  onClick?: () => void;
  onMarkerClick?: (position: [number, number]) => void;
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
  size = 44,
  iconAnchor,
  popupAnchor,
  popup,
  popupDescription,
  popupType,
  zIndexOffset,
  onClick,
  onMarkerClick,
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
        // Build popup HTML with type indicator
        const typeIndicator = popupType
          ? `<div class="poi-popup-type" style="background-color: ${popupType.color};"></div>`
          : '';

        const popupHtml = `
          <div class="poi-popup-container">
            ${typeIndicator}
            <div class="poi-popup-content">
              <strong>${popup}</strong>
            </div>
          </div>
        `;

        markerRef.current.bindPopup(popupHtml, {
          className: 'custom-popup',
          closeButton: true,
          closeOnClick: true,
        });
      }

      if (onClick) {
        markerRef.current.on('click', onClick);
      }

      // Pan map to center on marker when clicked
      if (onMarkerClick) {
        markerRef.current.on('click', () => {
          onMarkerClick(position);
        });
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
  }, [map, position, color, size, iconAnchor, popupAnchor, popup, popupDescription, popupType, zIndexOffset, onClick, onMarkerClick, onCreate]);

  return null;
}
