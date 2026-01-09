'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPreviewProps {
  tileUrl?: string;
  filter?: string;
  height?: string;
  className?: string;
  overlayUrl?: string;
  backgroundColor?: string;
  customCss?: string;
}

/**
 * Map preview component to test different tile providers and filters.
 */
export default function MapPreview({
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  filter = 'none',
  height = '200px',
  className = '',
  overlayUrl,
  backgroundColor,
  customCss
}: MapPreviewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add custom CSS for building hiding
    if (customCss) {
      const style = document.createElement('style');
      style.textContent = customCss;
      document.head.appendChild(style);
    }

    link.onload = async () => {
      const L = (await import('leaflet')).default;

      const map = L.map(mapContainerRef.current!, {
        zoomControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: false,
        preferCanvas: true,
      }).setView([-36.9497, 174.7912], 16);
    

      // Base tile layer
      L.tileLayer(tileUrl, {
        maxZoom: 18,
        crossOrigin: 'anonymous',
      }).addTo(map);

      // Overlay layer (for option C - two layer approach)
      if (overlayUrl) {
        L.tileLayer(overlayUrl, {
          maxZoom: 18,
          crossOrigin: 'anonymous',
        }).addTo(map);
      }

      // Custom marker - new pin design
      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" style="
          color: #D95D39;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        ">
          <path fill="currentColor" d="M136 127.42V232a8 8 0 0 1-16 0V127.42a56 56 0 1 1 16 0"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([-36.9497, 174.7912], { icon: customIcon }).addTo(map);
      marker.setZIndexOffset(1000);

      setMapLoaded(true);
    };

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [tileUrl, overlayUrl, customCss]);

  return (
    <div 
      ref={mapContainerRef}
      className={className}
      style={{ 
        height,
        borderRadius: '8px',
        overflow: 'hidden',
        filter,
        backgroundColor: backgroundColor || undefined,
        opacity: mapLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease'
      }}
    />
  );
}

// Map variation interface
interface MapVariation {
  name: string;
  tileUrl: string;
  filter: string;
  description: string;
  overlayUrl?: string;
  backgroundColor?: string;
  customCss?: string;
}

// Pre-defined map variations
export const MAP_VARIATIONS: Record<string, MapVariation> = {
  'openstreetmap-default': {
    name: 'OpenStreetMap Default',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    filter: 'none',
    description: 'Standard OSM colors'
  },
  'openstreetmap-muted': {
    name: 'OpenStreetMap Muted',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    filter: 'sepia(0.2) saturate(0.7) brightness(0.95)',
    description: 'Warm, muted tones'
  },
  'openstreetmap-night': {
    name: 'OpenStreetMap Night',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    filter: 'brightness(0.7) contrast(1.1) saturate(0.5)',
    description: 'Darkened, low saturation'
  },
  'cartodb-light': {
    name: 'CartoDB Light',
    tileUrl: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    filter: 'none',
    description: 'Clean, minimal light tiles'
  },
  'cartodb-light-muted': {
    name: 'CartoDB Light Muted',
    tileUrl: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    filter: 'sepia(0.15) saturate(0.8) brightness(1.02)',
    description: 'Clean with warm filter'
  },
  'cartodb-voyager': {
    name: 'CartoDB Voyager',
    tileUrl: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    filter: 'none',
    description: 'Detailed, shows parks/landmarks'
  },
  'cartodb-voyager-muted': {
    name: 'CartoDB Voyager Muted',
    tileUrl: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    filter: 'sepia(0.2) saturate(0.75) brightness(0.97)',
    description: 'Voyager with warm filter'
  },
  'stadia-toner': {
    name: 'Stadia Toner',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    filter: 'contrast(1.1) brightness(1.1)',
    description: 'Black/white, roads only'
  },
  'stadia-toner-lite': {
    name: 'Stadia Toner Lite',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
    filter: 'contrast(1.1)',
    description: 'Light version, very minimal'
  },
  'osm-forest': {
    name: 'Forest Theme',
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    filter: 'sepia(0.3) saturate(0.6) hue-rotate(20deg) brightness(0.9)',
    description: 'Forest greens and warm tones'
  },
  // Stadia Toner variations - abstract/editorial style
  'stadia-toner-original': {
    name: 'Stadia Toner Original',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'none',
    backgroundColor: '#ffffff',
    description: 'Black/white toner with labels'
  },
  'stadia-toner-light': {
    name: 'Stadia Toner Light',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite_labels/{z}/{x}/{y}{r}.png',
    filter: 'contrast(1.05) brightness(1.02)',
    backgroundColor: '#f8f8f8',
    description: 'Light grayscale with labels'
  },
  'stadia-toner-warm': {
    name: 'Stadia Toner Warm',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'sepia(0.25) saturate(0.9) contrast(0.95)',
    backgroundColor: '#F4F1EA',
    description: 'Toner with warm/cream tones + labels'
  },
  'stadia-toner-cool': {
    name: 'Stadia Toner Cool',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'hue-rotate(190deg) saturate(0.8) contrast(0.95)',
    backgroundColor: '#E8EDE6',
    description: 'Toner with cool/sage tones + labels'
  },
  'stadia-toner-dark': {
    name: 'Stadia Toner Dark',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'brightness(0.85) contrast(1.1) saturate(0.7)',
    backgroundColor: '#1A2218',
    description: 'Dark charcoal version with labels'
  },
  'stadia-toner-bone': {
    name: 'Stadia Toner Bone',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'sepia(0.15) contrast(0.95) brightness(0.98)',
    backgroundColor: '#F4F1EA',
    customCss: `
      .leaflet-tile-pane { filter: sepia(0.2) contrast(0.92) brightness(0.97); }
    `,
    description: 'Toner on bone background with labels'
  },
  'stadia-toner-forest': {
    name: 'Stadia Toner Forest',
    tileUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png',
    overlayUrl: 'https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png',
    filter: 'sepia(0.1) hue-rotate(15deg) saturate(0.85)',
    backgroundColor: '#2C3E2D',
    customCss: `
      .leaflet-tile-pane { filter: sepia(0.15) hue-rotate(20deg) saturate(0.9) contrast(0.95); }
    `,
    description: 'Toner on forest background with labels'
  },
  // Option A: CartoDB Light with building suppression
  'option-a-light-forest': {
    name: 'Option A: Light Forest',
    tileUrl: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    filter: 'sepia(0.1) saturate(0.85) brightness(1.01)',
    backgroundColor: '#2C3E2D',
    customCss: `
      .leaflet-tile-pane { filter: sepia(0.1) saturate(0.9) brightness(0.95); }
      .leaflet-tile-pane image { opacity: 0.7; }
    `,
    description: 'Light base, forest bg, muted tiles'
  },
  // Option B: CartoDB Voyager with building suppression  
  'option-b-voyager-roads': {
    name: 'Option B: Voyager Roads',
    tileUrl: 'https://a.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png',
    overlayUrl: 'https://a.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
    filter: 'sepia(0.15) saturate(0.8) brightness(0.98)',
    backgroundColor: '#F4F1EA',
    customCss: `
      .leaflet-tile-pane { filter: sepia(0.15) saturate(0.85) contrast(0.95); }
    `,
    description: 'Voyager base, separate labels layer'
  },
  // Option C: Two-layer approach - land + roads overlay
  'option-c-two-layer': {
    name: 'Option C: Two-Layer',
    tileUrl: 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    filter: 'sepia(0.1) saturate(0.85) brightness(1.02)',
    backgroundColor: '#E8EDE6',
    customCss: `
      .leaflet-tile-pane { filter: sepia(0.1) saturate(0.9); }
    `,
    description: 'Clean base, roads emphasized'
  },
};
