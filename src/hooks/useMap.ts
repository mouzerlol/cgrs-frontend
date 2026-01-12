'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface MapOptions {
  center?: [number, number];
  zoom?: number;
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
}

interface UseMapOptions extends MapOptions {
  tileUrl?: string;
  tileOptions?: {
    maxZoom?: number;
    crossOrigin?: 'anonymous' | 'use-credentials';
    attribution?: string;
  };
}

/**
 * Hook for initializing and managing a Leaflet map instance.
 * Handles dynamic import, initialization, and cleanup.
 */
export function useMap(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseMapOptions = {}
) {
  const mapRef = useRef<L.Map | null>(null);
  const initializedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const initialize = useCallback(async () => {
    if (!containerRef.current || typeof window === 'undefined' || initializedRef.current) {
      return;
    }

    try {
      const L = (await import('leaflet')).default;

      const map = L.map(containerRef.current, {
        zoomControl: options.zoomControl ?? true,
        scrollWheelZoom: options.scrollWheelZoom ?? true,
        dragging: options.dragging ?? true,
        doubleClickZoom: options.doubleClickZoom ?? true,
        boxZoom: options.boxZoom ?? true,
        keyboard: options.keyboard ?? true,
        attributionControl: options.attributionControl ?? true,
        preferCanvas: options.preferCanvas ?? true,
        maxZoom: options.maxZoom,
        minZoom: options.minZoom,
      }).setView(options.center ?? [0, 0], options.zoom ?? 13);

      // Add tile layer if URL provided
      if (options.tileUrl) {
        L.tileLayer(options.tileUrl, {
          maxZoom: options.tileOptions?.maxZoom ?? 19,
          crossOrigin: options.tileOptions?.crossOrigin,
          attribution: options.tileOptions?.attribution,
        }).addTo(map);
      }

      mapRef.current = map;
      initializedRef.current = true;
      setIsLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      initializedRef.current = false;
    }
  }, [containerRef, options]);

  useEffect(() => {
    initialize();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [initialize]);

  return { map: mapRef.current, isLoaded };
}

/**
 * Hook for creating custom Leaflet markers with SVG icons.
 */
export function useMapMarker(
  map: L.Map | null,
  position: [number, number],
  options: {
    color?: string;
    size?: number;
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
  } = {}
) {
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!map) return;

    (async () => {
      const L = (await import('leaflet')).default;
      const size = options.size ?? 24;
      const iconAnchor = options.iconAnchor ?? [size / 2, size / 2];
      const popupAnchor = options.popupAnchor ?? [0, -size / 2];

      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" style="
          color: ${options.color ?? '#D95D39'};
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
        iconAnchor,
        popupAnchor,
      });

      markerRef.current = L.marker(position, { icon }).addTo(map);
    })();

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, position, options.color, options.size, options.iconAnchor, options.popupAnchor]);

  return markerRef.current;
}

/**
 * Hook for adding GeoJSON layers to a map.
 */
export function useGeoJSON(
  map: L.Map | null,
  geoJSON: GeoJSON.GeoJsonObject,
  options: {
    style?: L.PathOptions;
    onEachFeature?: (feature: GeoJSON.Feature, layer: L.Layer) => void;
  } = {}
) {
  const layerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!map) return;

    (async () => {
      const L = (await import('leaflet')).default;

      layerRef.current = L.geoJSON(geoJSON, {
        style: options.style,
        onEachFeature: options.onEachFeature,
      }).addTo(map);
    })();

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [map, geoJSON, options.style, options.onEachFeature]);

  return layerRef.current;
}
