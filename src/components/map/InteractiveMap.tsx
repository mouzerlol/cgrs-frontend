'use client';

import { useRef, useState } from 'react';
import { BOUNDARY_COORDINATES, MAP_CENTER, MAP_ZOOM, POINTS_OF_INTEREST, POI_TYPES } from '@/data/map-data';
import { cn } from '@/lib/utils';
import BaseMap from '@/components/map/BaseMap';
import MapMarker from '@/components/map/MapMarker';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';

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

  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapInitialized(true);

    // Add boundary polygon
    import('leaflet').then((L) => {
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
    });

    // Add scale control
    import('leaflet').then((L) => {
      L.control.scale({
        imperial: false,
        position: 'bottomleft',
      }).addTo(map);
    });
  };

  const handleMarkerCreate = (id: string) => (marker: L.Marker) => {
    markerRefs.current.set(id, marker);
  };

  const handlePOIClick = (poi: (typeof POINTS_OF_INTEREST)[number]) => {
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
  };

  // Group POIs by type for display
  const groupedPOIs = Object.entries(POI_TYPES).map(([type, { color, label }]) => ({
    type,
    color,
    label,
    pois: POINTS_OF_INTEREST.filter(poi => poi.type === type),
  })).filter(group => group.pois.length > 0);

  const tileUrl = getOSMTileUrl();
  const tileOptions = getOSMTileOptions();

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
          className={`interactive-map ${mapInitialized ? 'loaded' : ''}`}
          style={{ height: '70vh', minHeight: '500px' }}
        >
          {/* POI Markers */}
          {POINTS_OF_INTEREST.map((poi) => {
            const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];
            return (
              <MapMarker
                key={poi.id}
                map={mapRef.current}
                position={poi.coordinates}
                color={poiType.color}
                size={24}
                popup={`<strong>${poi.name}</strong><p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">${poi.description}</p>`}
                onCreate={handleMarkerCreate(poi.id)}
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
