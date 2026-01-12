'use client';

import { useRef, useCallback, useState, useEffect } from 'react';
import { POINTS_OF_INTEREST, POI_TYPES, BOUNDARY_COORDINATES } from '@/data/map-data';
import { cn } from '@/lib/utils';
import BaseMap from '@/components/map/BaseMap';

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
  // Track if user has interacted - we scroll on first interaction
  const hasScrolledRef = useRef(false);

  // Dynamic height based on viewport
  const [mapHeight, setMapHeight] = useState<number>(600);

  /**
   * Calculate available height for the map section.
   * Fills the viewport minus a small padding at the bottom.
   */
  const calculateMapHeight = useCallback(() => {
    if (typeof window === 'undefined') return 600;

    // Account for the sidebar header on mobile
    const minHeight = 400;
    const maxHeight = window.innerHeight - 40; // 40px padding at bottom

    return Math.max(minHeight, maxHeight);
  }, []);

  /**
   * Enter immersive map mode - scrolls to top and hides the header.
   * Uses a CSS class on the document to hide the fixed header.
   */
  const scrollToFullView = useCallback(() => {
    if (hasScrolledRef.current || !sectionRef.current) return;

    hasScrolledRef.current = true;

    // Add immersive mode class to hide the fixed header
    document.documentElement.classList.add('map-immersive-mode');

    // Get the section's position relative to the document
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop;

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
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
    const L = (await import('leaflet')).default;

    // Add scroll trigger on any map interaction
    // These events fire when user interacts with the map directly
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

      marker.bindPopup(`
        <div class="poi-popup">
          <strong>${poi.name}</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">${poi.description}</p>
        </div>
      `, {
        className: 'custom-popup',
      });

      markerRefs.current.set(poi.id, marker);
    });

    // Add boundary polygon
    L.geoJSON({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [BOUNDARY_COORDINATES],
      },
    } as GeoJSON.GeoJsonObject, {
      style: {
        color: '#D95D39',
        weight: 3,
        fillColor: '#D95D39',
        fillOpacity: 0.1,
        dashArray: '8, 4',
      },
    }).addTo(map);

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
