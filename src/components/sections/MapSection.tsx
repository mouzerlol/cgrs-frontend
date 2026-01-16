'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { POINTS_OF_INTEREST, POI_TYPES } from '@/data/map-data';
import { cn } from '@/lib/utils';
import BaseMap from '@/components/map/BaseMap';
import { useImmersiveScroll } from '@/hooks/useImmersiveScroll';
import { setupBoundaryMap } from '@/lib/maps';

// Define map configuration outside component to prevent re-renders
// CRITICAL: These must be stable references to avoid BaseMap useEffect re-running
const MAP_CENTER: [number, number] = [-36.9497, 174.7912];
const MAP_ZOOM = 17;
const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_TILE_OPTIONS = {
  maxZoom: 19,
  subdomains: ['a', 'b', 'c'] as ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
};

interface MapSectionProps {
  className?: string;
}

/**
 * Map section component with sidebar and interactive map.
 * Uses BaseMap for consistent initialization.
 */
export default function MapSection({ className }: MapSectionProps) {
  // Store the map instance in state so React tracks it
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Ref for scrolling the map section into full view
  const sectionRef = useRef<HTMLDivElement>(null);

  // Use the immersive scroll hook for consistent behavior
  const { enterImmersive: scrollToFullView } = useImmersiveScroll(sectionRef, {
    scrollUpThreshold: 50,
  });

  // Dynamic height based on viewport
  const [mapHeight, setMapHeight] = useState<number>(600);

  /**
   * Calculate available height for the map section.
   * Fills the viewport minus nav height, legend space, and padding.
   */
  const calculateMapHeight = useCallback(() => {
    if (typeof window === 'undefined') return 600;

    // Fixed nav height (64px) + small buffer at bottom for legend
    const navHeight = 64;
    const legendBuffer = 60; // Space for legend at bottom
    const padding = 20; // Extra padding
    const maxHeight = window.innerHeight - navHeight - legendBuffer - padding;

    // Minimum height for usability
    const minHeight = 400;

    return Math.max(minHeight, maxHeight);
  }, []);

  // Handle window resize to recalculate map height
  useEffect(() => {
    const handleResize = () => {
      setMapHeight(calculateMapHeight());
    };

    // Calculate initial height
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateMapHeight]);

  // When map height changes, tell Leaflet to recalculate its size
  useEffect(() => {
    if (mapInstance) {
      // Small delay to ensure DOM has updated
      const timeoutId = setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [mapHeight, mapInstance]);

  // Handle map initialization
  const handleMapReady = useCallback(async (map: L.Map) => {
    console.log('MapSection: handleMapReady started');
    const L = (await import('leaflet')).default;

    // Add scroll trigger on any map interaction
    const scrollTriggerEvents = ['movestart', 'zoomstart', 'dragstart'];
    scrollTriggerEvents.forEach((eventName) => {
      map.once(eventName, scrollToFullView);
    });

    // Add POI markers
    POINTS_OF_INTEREST.forEach((poi) => {
      const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];

      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style="
          color: ${poiType.color};
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">
          <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.9"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
          <circle cx="12" cy="12" r="3" fill="${poiType.color}"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: 'poi-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
      });

      const marker = L.marker(poi.coordinates, { icon: customIcon }).addTo(map);

      // Build popup HTML with type indicator
      const typeIndicator = `<div class="poi-popup-type" style="background-color: ${poiType.color};"></div>`;

      const popupHtml = `
        <div class="poi-popup-container">
          ${typeIndicator}
          <div class="poi-popup-content">
            <strong>${poi.name}</strong>
            <p>${poi.description}</p>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-popup',
        closeButton: true,
        closeOnClick: true,
      });

      // Pan map to center on marker when clicked
      marker.on('click', () => {
        map.flyTo(poi.coordinates, 17, {
          duration: 0.8,
          easeLinearity: 0.25,
        });
      });

      markerRefs.current.set(poi.id, marker);
    });

    // Add boundary polygon and fit to boundary
    setupBoundaryMap(L, map);

    // Add scale control
    L.control.scale({
      imperial: false,
      position: 'bottomleft',
    }).addTo(map);

    // Force map to recalculate size
    map.invalidateSize();

    // Store map instance in state and mark as ready
    setMapInstance(map);
    setMapReady(true);
  }, [scrollToFullView]);

  /**
   * Handle POI click - navigate map to center on the POI location
   */
  const handlePOIClick = useCallback((poi: (typeof POINTS_OF_INTEREST)[number]) => {
    // Scroll section to top for full-view experience
    scrollToFullView();

    if (!mapInstance || !mapReady) {
      console.warn('Map not ready yet');
      return;
    }

    // Update selected state
    setSelectedPOI(poi.id);

    // Close any existing popup
    mapInstance.closePopup();

    // Navigate to POI coordinates
    // Using setView for immediate response, or flyTo for animation
    mapInstance.flyTo(poi.coordinates, 17, {
      duration: 1.2,
      easeLinearity: 0.25,
    });

    // Open popup after animation completes
    mapInstance.once('moveend', () => {
      const marker = markerRefs.current.get(poi.id);
      if (marker) {
        marker.openPopup();
      }
    });
  }, [mapInstance, mapReady, scrollToFullView]);

  // Group POIs by type for display
  const groupedPOIs = Object.entries(POI_TYPES).map(([type, { color, label }]) => ({
    type,
    color,
    label,
    pois: POINTS_OF_INTEREST.filter(poi => poi.type === type),
  })).filter(group => group.pois.length > 0);

  const handleHomeClick = useCallback((map: L.Map) => {
    import('leaflet').then((L) => {
      import('@/lib/maps').then(({ getBoundaryFeature }) => {
        const bounds = L.default.geoJSON(getBoundaryFeature() as GeoJSON.GeoJsonObject).getBounds();
        // Fly to center at the map's maximum zoom level
        const maxZoom = map.getMaxZoom() || 18;
        map.flyTo(bounds.getCenter(), maxZoom, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      });
    });
  }, []);

  return (
    <div
      ref={sectionRef}
      className={cn('map-section-wrapper', className)}
      data-testid="map-section-wrapper"
    >
      {/* POI Sidebar */}
      <aside className="map-sidebar">
        <div className="sidebar-header">
          <h3>Points of Interest</h3>
          <p>Click to navigate</p>
        </div>

        {groupedPOIs.map(({ type, color, label, pois }) => (
          <div key={type} className="poi-group">
            <div className="poi-group-header">
              <span className="poi-group-color" style={{ backgroundColor: color }} />
              <span>{label}</span>
              <span className="poi-count">({pois.length})</span>
            </div>
            <ul className="poi-list">
              {pois.map((poi) => (
                <li key={poi.id}>
                  <button
                    type="button"
                    onClick={() => handlePOIClick(poi)}
                    disabled={!mapReady}
                    className={cn(
                      'poi-button',
                      selectedPOI === poi.id && 'selected',
                      !mapReady && 'loading'
                    )}
                    style={{ '--poi-color': color } as React.CSSProperties}
                  >
                    <span className="poi-name">{poi.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>

      {/* Map Container - height dynamically adjusts to fill viewport */}
      <div
        className="map-container"
        style={{ height: mapHeight }}
      >
        <BaseMap
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          tileUrl={OSM_TILE_URL}
          tileOptions={OSM_TILE_OPTIONS}
          zoomControl={true}
          showHomeControl={true}
          homeControlPosition="topleft"
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
          attributionControl={true}
          preferCanvas={true}
          maxZoom={18}
          minZoom={12}
          onMapReady={handleMapReady}
          onHomeClick={handleHomeClick}
          className="interactive-map"
          style={{ height: '100%' }}
        />

        {/* Legend */}
        <div className="map-legend">
          <h4>Legend</h4>
          <ul className="legend-list">
            {Object.entries(POI_TYPES).map(([key, { color, label }]) => (
              <li key={key} className="legend-item">
                <span className="legend-marker" style={{ backgroundColor: color }} />
                <span className="legend-label">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
