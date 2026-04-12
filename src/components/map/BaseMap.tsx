'use client';

import 'leaflet/dist/leaflet.css';
import type { TileLayerOptions } from 'leaflet';
import { useRef, useEffect, useState, ReactNode } from 'react';

/** Options passed to Leaflet TileLayer for base and overlay raster tiles. */
export interface BaseMapTileLayerOptions {
  maxZoom?: number;
  maxNativeZoom?: number;
  crossOrigin?: string;
  attribution?: string;
  /** 0–1; use on overlays (e.g. cadastral) to blend with the basemap. */
  opacity?: number;
  /** LDS and similar CDNs use tiles-{s}.… with subdomains (e.g. abcd). */
  subdomains?: string | string[];
}

/**
 * Builds the options object for `L.tileLayer`. Omits `subdomains` when unset so Leaflet keeps
 * its default (`abc`); passing `subdomains: undefined` overrides that default and breaks
 * `getTileUrl` (Leaflet always calls `_getSubdomain`).
 */
export function buildLeafletRasterTileOptions(
  opts: BaseMapTileLayerOptions,
  resolved: { maxZoom: number; maxNativeZoom: number },
): TileLayerOptions {
  return {
    maxZoom: resolved.maxZoom,
    maxNativeZoom: resolved.maxNativeZoom,
    crossOrigin: opts.crossOrigin as boolean | 'anonymous' | 'use-credentials' | undefined,
    attribution: opts.attribution,
    ...(opts.opacity != null ? { opacity: opts.opacity } : {}),
    ...(opts.subdomains != null ? { subdomains: opts.subdomains } : {}),
  };
}

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  tileUrl?: string;
  tileOptions?: BaseMapTileLayerOptions;
  /** Optional second tile layer drawn above the base (e.g. LINZ Property Titles on aerial). */
  overlayTileUrl?: string;
  overlayTileOptions?: BaseMapTileLayerOptions;
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
  overlayTileUrl,
  overlayTileOptions = {},
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

  // Store callbacks and object props in refs to avoid triggering re-initialization.
  // These refs always hold the latest values so the init effect can read them
  // without including unstable references in its dependency array.
  const onMapReadyRef = useRef(onMapReady);
  const onHomeClickRef = useRef(onHomeClick);
  const tileOptionsRef = useRef(tileOptions);
  const overlayTileOptionsRef = useRef(overlayTileOptions);
  const centerRef = useRef(center);
  const maxZoomRef = useRef(maxZoom);

  useEffect(() => { onMapReadyRef.current = onMapReady; }, [onMapReady]);
  useEffect(() => { onHomeClickRef.current = onHomeClick; }, [onHomeClick]);
  useEffect(() => { tileOptionsRef.current = tileOptions; }, [tileOptions]);
  useEffect(() => { overlayTileOptionsRef.current = overlayTileOptions; }, [overlayTileOptions]);
  useEffect(() => { centerRef.current = center; }, [center]);
  useEffect(() => { maxZoomRef.current = maxZoom; }, [maxZoom]);

  // Map initialization effect - runs only once on mount.
  // All mutable/unstable props are accessed via refs so that changing callbacks
  // or object props does not destroy and recreate the map instance.
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

        const opts = tileOptionsRef.current;
        if (tileUrl) {
          L.tileLayer(
            tileUrl,
            buildLeafletRasterTileOptions(opts, {
              maxZoom: opts.maxZoom ?? 19,
              maxNativeZoom: opts.maxNativeZoom ?? opts.maxZoom ?? 19,
            }),
          ).addTo(map);
        }

        if (overlayTileUrl) {
          const o = overlayTileOptionsRef.current;
          L.tileLayer(
            overlayTileUrl,
            buildLeafletRasterTileOptions(o, {
              maxZoom: o.maxZoom ?? opts.maxZoom ?? 19,
              maxNativeZoom: o.maxNativeZoom ?? o.maxZoom ?? opts.maxZoom ?? 19,
            }),
          ).addTo(map);
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
            homeButton.setAttribute('aria-label', 'Return to community boundary');
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
              if (onHomeClickRef.current) {
                onHomeClickRef.current(map);
              } else {
                // Default fallback: fly to center at max zoom
                const zoom = map.getMaxZoom() || maxZoomRef.current || 18;
                map.flyTo(centerRef.current, zoom, {
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

        if (onMapReadyRef.current) {
          onMapReadyRef.current(map);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
