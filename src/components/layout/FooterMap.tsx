'use client';

import { useEffect, useRef, useState } from 'react';

interface FooterMapProps {
  className?: string;
}

/**
 * Interactive Leaflet map component for footer location display.
 * Uses OpenStreetMap tiles - free and no API key required.
 * Styled to match the CGRS color scheme (forest, terracotta, bone).
 */
export default function FooterMap({ className }: FooterMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Wait for CSS to load then initialize map
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

      // Add tiles with subtle forest/sage filter to match color scheme
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: 'anonymous',
      }).addTo(map);

      // Custom marker using solid SVG map pin icon
      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 256 256" style="
          color: #D95D39;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
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
      
      // Ensure marker is visible
      marker.setZIndexOffset(1000);

      setMapLoaded(true);
    };

    return () => {
      // Cleanup
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '160px',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#2C3E2D'
    }}>
      <div 
        ref={mapContainerRef}
        className={className}
        style={{ 
          width: '100%', 
          height: '100%',
          opacity: mapLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      {/* Simple attribution */}
      <a 
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          fontSize: '6px',
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'none',
          zIndex: 1001
        }}
      >
        © OSM
      </a>
      
      {/* Custom marker styles */}
      <style>{`
        .custom-marker {
          background: none;
          border: none;
        }
        
        .footer-map-container .leaflet-tile-pane {
          filter: sepia(0.2) saturate(0.8) brightness(0.9);
        }
        
        .footer-map-container:hover .leaflet-tile-pane {
          filter: sepia(0.1) saturate(1) brightness(1);
        }
      `}</style>
    </div>
  );
}
