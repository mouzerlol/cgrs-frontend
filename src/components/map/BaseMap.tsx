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
        const L = (await import('leaflet')).default;

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
