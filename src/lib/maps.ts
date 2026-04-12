/**
 * OpenStreetMap Standard tile configuration
 * Free to use without API key or registration.
 * See: https://www.openstreetmap.org/copyright
 */
export const OSM_CONFIG = {
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  subdomains: ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19,
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
    maxZoom: 19,
    maxNativeZoom: 19,
    subdomains: [...OSM_CONFIG.subdomains],
    attribution: OSM_CONFIG.attribution,
  };
}

/**
 * Web Mercator ground resolution in meters per pixel at a latitude and integer zoom.
 * Relates Leaflet zoom to on-screen ground distance; nominal "map scale" still depends on display DPI.
 */
export function metersPerPixelWebMercator(latitudeDeg: number, zoom: number): number {
  return 156543.03392804097 * Math.cos((latitudeDeg * Math.PI) / 180) / 2 ** zoom;
}

/**
 * Stadia Maps configuration
 * Get your free API key at: https://client.stadiamaps.com/
 *
 * Free tier includes generous limits for development and production use.
 */

export const STADIA_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_STADIA_MAPS_API_KEY || '',

  // Available tile styles
  // Full list: https://docs.stadiamaps.com/map-styles/
  styles: {
    /** Smooth light theme - most popular for general use */
    alidade_smooth: {
      url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    },

    /** Smooth dark theme */
    alidade_smooth_dark: {
      url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    },

    /** Outdoors theme - good for hiking/trail maps */
    outdoors: {
      url: 'https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    },

    /** OSM Bright - familiar road map style */
    osmbright: {
      url: 'https://tiles.stadiamaps.com/tiles/osmbright/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    },

    /** Stamen Toner - high contrast black/white (currently in use) */
    stamen_toner: {
      url: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    },

    /** Stamen Toner Lite - simpler black/white */
    stamen_toner_lite: {
      url: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    },

    /** Stamen Watercolor - artistic style */
    stamen_watercolor: {
      url: 'https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    },
  },

  /** Default style to use */
  defaultStyle: 'stamen_toner' as 'stamen_toner',
} as const;

/**
 * Get the tile URL with API key appended for Stadia Maps
 */
export function getStadiaTileUrl(style: 'alidade_smooth' | 'alidade_smooth_dark' | 'outdoors' | 'osmbright' | 'stamen_toner' | 'stamen_toner_lite' | 'stamen_watercolor' = STADIA_MAPS_CONFIG.defaultStyle): string {
  const baseUrl = STADIA_MAPS_CONFIG.styles[style].url;

  if (STADIA_MAPS_CONFIG.apiKey) {
    return `${baseUrl}?api_key=${STADIA_MAPS_CONFIG.apiKey}`;
  }

  return baseUrl;
}

/**
 * Community map basemap: Stadia **Outdoors** — OSM-based terrain shading, stronger linework, familiar road colours.
 * Darkening is applied in CSS on `.interactive-map` (first tile layer only) so LINZ overlays stay unfiltered.
 * For a native dark theme with less relief, switch to `getStadiaTileUrl('alidade_smooth_dark')` here instead.
 * Optional `NEXT_PUBLIC_STADIA_MAPS_API_KEY` for production quotas.
 */
export function getCommunityMapBaseTileUrl(): string {
  return getStadiaTileUrl('outdoors');
}

/**
 * Tile options for the community map basemap; allows one zoom level of over-scale past native tiles.
 */
export function getCommunityMapBaseTileOptions() {
  const style = STADIA_MAPS_CONFIG.styles.outdoors;
  return {
    maxZoom: 21,
    maxNativeZoom: style.maxZoom,
    crossOrigin: 'anonymous' as const,
    attribution: style.attribution,
  };
}

// -----------------------------------------------------------------------------
// High-Resolution Tile Providers
// LINZ Basemaps for NZ, ArcGIS for international fallback
// -----------------------------------------------------------------------------

/**
 * LINZ Basemaps configuration for high-resolution NZ aerial imagery.
 * Free API key available at https://basemaps.linz.govt.nz/
 * Supports up to zoom level 21 for NZ coverage.
 */
export const LINZ_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_LINZ_API_KEY || '',
  url: 'https://basemaps.linz.govt.nz/v1/tiles/aerial/WebMercatorQuad/{z}/{x}/{y}.webp',
  maxZoom: 21,
  attribution: '&copy; <a href="https://www.linz.govt.nz/linz-copyright">LINZ CC BY 4.0</a> &copy; Imagery Basemap contributors',
};

/**
 * Get the tile URL for LINZ Basemaps aerial imagery.
 */
export function getLINZTileUrl(): string {
  if (LINZ_CONFIG.apiKey) {
    return `${LINZ_CONFIG.url}?api=${LINZ_CONFIG.apiKey}`;
  }
  return LINZ_CONFIG.url;
}

/**
 * Get tile options for LINZ Basemaps.
 */
export function getLINZTileOptions() {
  return {
    maxZoom: LINZ_CONFIG.maxZoom,
    maxNativeZoom: 21,
    crossOrigin: 'anonymous' as const,
    attribution: LINZ_CONFIG.attribution,
  };
}

/**
 * LINZ Data Service (LDS) XYZ tiles — NZ Property Titles raster layer.
 * Layer catalogue: https://data.linz.govt.nz/layer/50804-nz-property-titles/
 * Leaflet setup: https://www.linz.govt.nz/guidance/data-service/linz-data-service-guide/map-tile-services/using-lds-xyz-services-leaflet
 */
export const LINZ_LDS_PROPERTY_TITLES_LAYER_ID = 50804;

/**
 * API key for LDS tile CDN (`tiles-*.data-cdn.linz.govt.nz`).
 *
 * Must be a **LINZ Data Service** key from https://data.linz.govt.nz/ (Profile → API Keys).
 * The LINZ **Basemaps** key (`NEXT_PUBLIC_LINZ_API_KEY`, basemaps.linz.govt.nz) is a different product
 * and will typically produce HTTP 403 if used here.
 *
 * If tiles still return 403: check the key's domain / referrer allowlist in LDS (include `localhost`
 * and your production origin for browser tile requests), confirm the key is "Data access only" and
 * not expired, then rotate the key if it may have leaked.
 */
export function getLinzLdsApiKey(): string {
  return process.env.NEXT_PUBLIC_LINZ_LDS_API_KEY || '';
}

/**
 * XYZ template for NZ Property Titles (EPSG:3857). Requires subdomains a-d on the tile layer.
 * Returns null when no API key is configured (overlay is skipped).
 */
export function getLINZPropertyTitlesTileUrl(): string | null {
  const key = getLinzLdsApiKey();
  if (!key) {
    return null;
  }
  return `https://tiles-{s}.data-cdn.linz.govt.nz/services;key=${key}/tiles/v4/layer=${LINZ_LDS_PROPERTY_TITLES_LAYER_ID}/EPSG:3857/{z}/{x}/{y}.png`;
}

/**
 * Tile options for NZ Property Titles overlay. Keep maxNativeZoom aligned with LDS pyramid for this layer.
 */
export function getLINZPropertyTitlesTileOptions() {
  return {
    maxZoom: 21,
    maxNativeZoom: 18,
    /** Blends parcel boundaries into the basemap so the cadastral grid is less dominant than full-opacity tiles. */
    opacity: 0.65,
    subdomains: [...(['a', 'b', 'c', 'd'] as const)],
    crossOrigin: 'anonymous' as const,
    attribution:
      '&copy; <a href="https://www.linz.govt.nz/">LINZ</a> &mdash; ' +
      '<a href="https://data.linz.govt.nz/layer/50804-nz-property-titles/">NZ Property Titles</a> (CC BY 4.0)',
  };
}

/**
 * ArcGIS World Imagery configuration for global fallback.
 * No API key required. Supports up to zoom level 23 with maxNativeZoom 19.
 */
export const ARCGIS_CONFIG = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  maxZoom: 23,
  maxNativeZoom: 19,
  attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
};

/**
 * Get tile options for ArcGIS World Imagery.
 */
export function getArcGISTileOptions() {
  return {
    maxZoom: ARCGIS_CONFIG.maxZoom,
    maxNativeZoom: ARCGIS_CONFIG.maxNativeZoom,
    crossOrigin: 'anonymous' as const,
    attribution: ARCGIS_CONFIG.attribution,
  };
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

/**
 * Create boundary layer and fit map to boundary in one operation
 * @param L - Leaflet instance (imported dynamically)
 * @param map - Leaflet map instance
 * @param padding - Padding in pixels (default: 30px)
 * @param style - Optional custom styling
 */
export async function setupBoundaryMap(
  L: typeof import('leaflet'),
  map: L.Map,
  padding = 30,
  style: BoundaryStyleOptions = BOUNDARY_STYLE
): Promise<void> {
  addBoundaryLayer(L, map, style);
  fitMapToBoundary(L, map, padding);
}