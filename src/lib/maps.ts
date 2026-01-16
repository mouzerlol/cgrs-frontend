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
 * Get tile options for OpenStreetMap Standard tiles
 */
export function getOSMTileOptions() {
  return {
    maxZoom: OSM_CONFIG.maxZoom,
    subdomains: OSM_CONFIG.subdomains,
    attribution: OSM_CONFIG.attribution,
  };
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
 * Get tile options for BaseMap component
 */
export function getStadiaTileOptions(style: 'alidade_smooth' | 'alidade_smooth_dark' | 'outdoors' | 'osmbright' | 'stamen_toner' | 'stamen_toner_lite' | 'stamen_watercolor' = STADIA_MAPS_CONFIG.defaultStyle) {
  const styleConfig = STADIA_MAPS_CONFIG.styles[style];
  return {
    maxZoom: styleConfig.maxZoom,
    crossOrigin: 'anonymous' as const,
    attribution: styleConfig.attribution,
  };
}

/**
 * Get style configuration
 */
export function getStadiaStyleConfig(style: 'alidade_smooth' | 'alidade_smooth_dark' | 'outdoors' | 'osmbright' | 'stamen_toner' | 'stamen_toner_lite' | 'stamen_watercolor' = STADIA_MAPS_CONFIG.defaultStyle) {
  return STADIA_MAPS_CONFIG.styles[style];
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
  color: '#D95D39',
  weight: 3,
  fillColor: '#D95D39',
  fillOpacity: 0.1,
  dashArray: '8, 4',
};

/** Alternative styling for compact/static boundary display */
export const BOUNDARY_STYLE_COMPACT: BoundaryStyleOptions = {
  color: '#D95D39',
  weight: 2,
  fillColor: '#D95D39',
  fillOpacity: 0.12,
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
