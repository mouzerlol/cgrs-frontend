'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  tileUrl?: string;
  tileOptions?: {
    maxZoom?: number;
    crossOrigin?: string;
    attribution?: string;
  };
  zoomControl?: boolean;
  showHomeControl?: boolean;
  homeControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  scrollWheelZoom?: boolean;
  dragging?: boolean;
  doubleClickZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
  attributionControl?: boolean;
  preferCanvas?: boolean;
  maxZoom?: number;
  minZoom?: number;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMapReady?: (map: L.Map) => void;
  onHomeClick?: (map: L.Map) => void;
}

/**
 * Base Leaflet map component that handles initialization and tile loading.
 * All other map components should wrap this or use it as a foundation.
 */
export default function BaseMap({
  center = [0, 0],
  zoom = 13,
  tileUrl,
  tileOptions = {},
  zoomControl = true,
  showHomeControl = true,
  homeControlPosition = 'topright',
  scrollWheelZoom = true,
  dragging = true,
  doubleClickZoom = true,
  boxZoom = true,
  keyboard = true,
  attributionControl = true,
  preferCanvas = true,
  maxZoom,
  minZoom,
  children,
  className,
  style,
  onMapReady,
  onHomeClick,
}: BaseMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const initializedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    const initMap = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        const Leaflet = await import('leaflet');
        const L = Leaflet.default;

        if (!containerRef.current) return;
        
        const map = L.map(containerRef.current, {
          zoomControl,
          scrollWheelZoom,
          dragging,
          doubleClickZoom,
          boxZoom,
          keyboard,
          attributionControl,
          preferCanvas,
          maxZoom,
          minZoom,
        }).setView(center, zoom);

        if (tileUrl) {
          L.tileLayer(tileUrl, {
            maxZoom: tileOptions.maxZoom ?? 19,
            crossOrigin: tileOptions.crossOrigin as boolean | 'anonymous' | 'use-credentials' | undefined,
            attribution: tileOptions.attribution,
          }).addTo(map);
        }

        // Add home button control
        if (showHomeControl) {
          // Robust approach: append directly to the zoom control container
          // This ensures it appears directly under the zoom buttons (+) and (-)
          const zoomControlContainer = containerRef.current?.querySelector('.leaflet-control-zoom');
          if (zoomControlContainer) {
            const homeButton = L.DomUtil.create('a', 'leaflet-control-home-button leaflet-bar-part leaflet-bar-part-bottom', zoomControlContainer as HTMLElement);
            homeButton.href = '#';
            homeButton.title = 'Return to community boundary';
            homeButton.role = 'button';
            homeButton.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display: block; margin: auto;">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            `;

            // Fix the previous button (zoom-out) to not have bottom corners rounded if it's not the last anymore
            const zoomOutButton = zoomControlContainer.querySelector('.leaflet-control-zoom-out');
            if (zoomOutButton) {
              (zoomOutButton as HTMLElement).style.borderBottom = '1px solid var(--sage-light)';
              (zoomOutButton as HTMLElement).classList.remove('leaflet-bar-part-bottom');
            }

            L.DomEvent.disableClickPropagation(homeButton);
            L.DomEvent.on(homeButton, 'click', (e: Event) => {
              L.DomEvent.preventDefault(e);
              L.DomEvent.stopPropagation(e);
              if (onHomeClick) {
                onHomeClick(map);
              } else {
                // Default fallback: fly to center at max zoom
                const zoom = map.getMaxZoom() || maxZoom || 18;
                map.flyTo(center, zoom, {
                  duration: 1.5,
                  easeLinearity: 0.25
                });
              }
            });
          }
        }

        mapRef.current = map;
        setIsLoaded(true);

        map.invalidateSize();

        if (onMapReady) {
          onMapReady(map);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        initializedRef.current = false;
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [
    center,
    zoom,
    tileUrl,
    tileOptions,
    zoomControl,
    scrollWheelZoom,
    dragging,
    doubleClickZoom,
    boxZoom,
    keyboard,
    attributionControl,
    preferCanvas,
    maxZoom,
    minZoom,
    onMapReady,
    onHomeClick,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Get the current map instance for external access.
 */
export function useMapInstance() {
  const mapRef = useRef<L.Map | null>(null);
  const getMap = () => mapRef.current;

  return { getMap, mapRef };
}
