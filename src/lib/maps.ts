/**
 * OpenStreetMap Standard tile configuration.
 * Free to use without API key or registration. Commercial use permitted (ODbL).
 * See: https://www.openstreetmap.org/copyright
 */
export const OSM_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
  maxNativeZoom: 19,
} as const;

/**
 * Get the tile URL for OpenStreetMap Standard tiles
 */
export function getOSMTileUrl(): string {
  return OSM_CONFIG.url;
}

/**
 * Get tile options for OpenStreetMap Standard tiles.
 * Returns a mutable copy of subdomains for Leaflet TileLayerOptions compatibility.
 */
export function getOSMTileOptions() {
  return {
    maxZoom: 19, // OSM tiles only exist up to 19 - no overzoom
    maxNativeZoom: 19,
    crossOrigin: 'anonymous' as const,
    subdomains: [...OSM_CONFIG.subdomains],
    attribution: OSM_CONFIG.attribution,
  };
}

/**
 * Get community basemap options for the main map page.
 * Uses OSM with max zoom 19.
 */
export function getCommunityMapLeafletBasemap() {
  return {
    tileUrl: getOSMTileUrl(),
    tileOptions: getOSMTileOptions(),
    maxZoom: 19,
  };
}

/**
 * Get widget basemap options for small map components.
 * Uses OSM with max zoom 19.
 */
export function getNzWidgetLeafletBasemap() {
  return {
    tileUrl: getOSMTileUrl(),
    tileOptions: getOSMTileOptions(),
    maxZoom: 19,
  };
}

/**
 * Web Mercator ground resolution in meters per pixel at a latitude and integer zoom.
 * Relates Leaflet zoom to on-screen ground distance; nominal "map scale" still depends on display DPI.
 */
export function metersPerPixelWebMercator(latitudeDeg: number, zoom: number): number {
  return 156543.03392804097 * Math.cos((latitudeDeg * Math.PI) / 180) / 2 ** zoom;
}

// -----------------------------------------------------------------------------
// Boundary Map Utilities
// Shared utilities for CGRS community boundary handling
// -----------------------------------------------------------------------------

import { BOUNDARY_COORDINATES } from '@/data/map-data';

/** Boundary style options type */
export interface BoundaryStyleOptions {
  color: string;
  weight: number;
  fillColor: string;
  fillOpacity: number;
  dashArray?: string;
}

/** Default styling for the community boundary polygon */
export const BOUNDARY_STYLE: BoundaryStyleOptions = {
  color: '#FF69B4',
  weight: 2,
  fillColor: '#FF69B4',
  fillOpacity: 0.15,
};

/** Alternative styling for compact/static boundary display */
export const BOUNDARY_STYLE_COMPACT: BoundaryStyleOptions = {
  color: '#FF69B4',
  weight: 2,
  fillColor: '#FF69B4',
  fillOpacity: 0.15,
};

/**
 * Get GeoJSON feature for the community boundary
 */
export function getBoundaryFeature(): GeoJSON.Feature {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [BOUNDARY_COORDINATES.map(coord => [...coord])],
    },
  };
}

/**
 * Create and add the boundary polygon layer to a map
 * @param L - Leaflet instance (imported dynamically)
 * @param map - Leaflet map instance
 * @param style - Optional custom styling (uses BOUNDARY_STYLE by default)
 * @returns The added GeoJSON layer
 */
export function addBoundaryLayer(
  L: typeof import('leaflet'),
  map: L.Map,
  style: BoundaryStyleOptions = BOUNDARY_STYLE
): L.GeoJSON {
  return L.geoJSON(getBoundaryFeature() as GeoJSON.GeoJsonObject, {
    style,
  }).addTo(map);
}

/**
 * Fit map view to show the entire boundary with optional padding
 * @param L - Leaflet instance (imported dynamically)
 * @param map - Leaflet map instance
 * @param padding - Padding in pixels (default: 30px)
 * @param options - Additional fitBounds options
 */
export function fitMapToBoundary(
  L: typeof import('leaflet'),
  map: L.Map,
  padding = 30,
  options: L.FitBoundsOptions = {}
): void {
  const bounds = L.geoJSON(getBoundaryFeature() as GeoJSON.GeoJsonObject).getBounds();
  map.fitBounds(bounds, {
    padding: [padding, padding],
    animate: true,
    duration: 1.5,
    ...options
  });
}