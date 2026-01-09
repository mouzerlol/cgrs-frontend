'use client';

import { useEffect, useRef, useState } from 'react';
import { BOUNDARY_COORDINATES, MAP_CENTER, MAP_ZOOM, POINTS_OF_INTEREST, POI_TYPES } from '@/data/map-data';

/**
 * Interactive Map component for the dedicated Map page
 * Features full Leaflet controls, boundary highlighting, and POI markers
 */
export default function InteractiveMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Check if map is already initialized on this container
      if ((mapContainerRef.current as unknown as { _leaflet_id?: number })._leaflet_id) {
        setMapInitialized(true);
        return;
      }

      // Create map with all controls enabled
      const map = L.map(mapContainerRef.current!, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM + 1, // Slightly closer for interactive view
        zoomControl: true,
        scrollWheelZoom: true,
        dragging: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        attributionControl: true,
        preferCanvas: true,
        maxZoom: 18,
        minZoom: 14,
      });

      // Base tiles - Stadia Toner Original
      L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Street names labels overlay
      L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_toner_labels/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
      }).addTo(map);

      // Development boundary polygon with terracotta styling
      L.geoJSON({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [BOUNDARY_COORDINATES],
        }
      } as GeoJSON.GeoJsonObject, {
        style: {
          color: '#D95D39',
          weight: 3,
          fillColor: '#D95D39',
          fillOpacity: 0.1,
          dashArray: '8, 4',
        }
      }).addTo(map);

      // Passive POI markers
      POINTS_OF_INTEREST.forEach((poi) => {
        const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];
        
        // Create custom marker SVG
        const iconHtml = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" style="
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
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          popupAnchor: [0, -12],
        });

        const marker = L.marker(poi.coordinates, { icon: customIcon }).addTo(map);
        
        // Add tooltip (passive - just shows on hover)
        marker.bindTooltip(poi.name, {
          permanent: false,
          direction: 'top',
          className: 'poi-tooltip',
          offset: [0, -15],
        });
      });

      // Add scale control
      L.control.scale({
        imperial: false,
        position: 'bottomleft',
      }).addTo(map);

      setMapInitialized(true);
    };

    initMap();
  }, []);

  return (
    <section className="map-section">
      <div className="map-container" style={{ background: '#eee', minHeight: '400px' }}>
        <div 
          ref={mapContainerRef}
          className={`interactive-map loaded`}
          style={{ height: '60vh', minHeight: '400px' }}
        />
      </div>
      
      <div className="map-legend">
        <h4>Points of Interest</h4>
        <ul className="legend-list">
          {Object.entries(POI_TYPES).map(([key, { color, label }]) => (
            <li key={key} className="legend-item">
              <span className="legend-marker" style={{ backgroundColor: color }} />
              <span className="legend-label">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
