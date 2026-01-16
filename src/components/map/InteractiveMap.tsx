'use client';

import { useRef, useState, useCallback, useMemo } from 'react';
import { MAP_CENTER, MAP_ZOOM, POINTS_OF_INTEREST, POI_TYPES } from '@/data/map-data';
import { cn } from '@/lib/utils';
import BaseMap from '@/components/map/BaseMap';
import MapMarker from '@/components/map/MapMarker';
import { getOSMTileUrl, getOSMTileOptions, setupBoundaryMap } from '@/lib/maps';

interface InteractiveMapProps {
  showSidebar?: boolean;
  showLegend?: boolean;
}

/**
 * Interactive Map component for the dedicated Map page.
 * Features full Leaflet controls, boundary highlighting, and POI markers.
 * Uses Stadia Maps Alidade Smooth tiles - clean, modern light theme.
 * Wraps BaseMap for consistent initialization.
 */
export default function InteractiveMap({ showSidebar = true, showLegend = true }: InteractiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // Tile configuration
  const tileUrl = getOSMTileUrl();
  const tileOptions = getOSMTileOptions();

  // Group POIs by type for sidebar display
  type POIItem = (typeof POINTS_OF_INTEREST)[number];
  const groupedPOIs = useMemo(() => {
    const groups = new Map<string, { type: string; color: string; label: string; pois: POIItem[] }>();

    for (const poi of POINTS_OF_INTEREST) {
      const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];
      if (!groups.has(poi.type)) {
        groups.set(poi.type, {
          type: poi.type,
          color: poiType.color,
          label: poiType.label,
          pois: [],
        });
      }
      groups.get(poi.type)!.pois.push(poi);
    }

    return Array.from(groups.values());
  }, []);

  const handleMapReady = useCallback((map: L.Map) => {
    mapRef.current = map;
    setMapInitialized(true);

    // Add boundary polygon and fit to boundary
    import('leaflet').then((L) => {
      setupBoundaryMap(L, map);
    });

    // Add scale control
    import('leaflet').then((L) => {
      L.control.scale({
        imperial: false,
        position: 'bottomleft',
      }).addTo(map);
    });
  }, []);

  const handleMarkerCreate = useCallback((id: string) => (marker: L.Marker) => {
    markerRefs.current.set(id, marker);
  }, []);

  const handleMarkerClick = useCallback((position: [number, number]) => {
    if (mapRef.current) {
      mapRef.current.flyTo(position, 17, {
        duration: 0.8,
        easeLinearity: 0.25,
      });
    }
  }, []);

  const handlePOIClick = useCallback((poi: (typeof POINTS_OF_INTEREST)[number]) => {
    setSelectedPOI(poi.id);
    
    if (mapRef.current) {
      mapRef.current.flyTo(poi.coordinates, 17, { duration: 1.5 });
    }

    setTimeout(() => {
      const marker = markerRefs.current.get(poi.id);
      if (marker) {
        marker.openPopup();
      }
    }, 1500);
  }, []);

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
    <section className="map-section relative">
      {/* POI Sidebar */}
      {showSidebar && (
        <div className="poi-sidebar">
          <div className="sidebar-header">
            <h3>Points of Interest</h3>
            <p className="text-sm opacity-60">Click to navigate</p>
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
                      onClick={() => handlePOIClick(poi)}
                      className={cn(
                        'poi-button',
                        selectedPOI === poi.id && 'selected'
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
        </div>
      )}

      {/* Map Container */}
      <div className="map-container" style={{ background: '#f5f5f5', minHeight: '400px', marginLeft: showSidebar ? '280px' : 0 }}>
        <BaseMap
          center={MAP_CENTER}
          zoom={MAP_ZOOM + 1}
          tileUrl={tileUrl}
          tileOptions={tileOptions}
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
          className={`interactive-map ${mapInitialized ? 'loaded' : ''}`}
          style={{ height: '70vh', minHeight: '500px' }}
        >
          {/* POI Markers - only render when map is ready */}
          {mapInitialized && POINTS_OF_INTEREST.map((poi) => {
            const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];
            return (
              <MapMarker
                key={poi.id}
                map={mapRef.current}
                position={poi.coordinates}
                color={poiType.color}
                size={24}
                popup={poi.name}
                popupDescription={poi.description}
                popupType={{ label: poiType.label, color: poiType.color }}
                onCreate={handleMarkerCreate(poi.id)}
                onMarkerClick={handleMarkerClick}
              />
            );
          })}
        </BaseMap>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="map-legend" style={{ marginLeft: showSidebar ? '280px' : 0 }}>
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
      )}
    </section>
  );
}
