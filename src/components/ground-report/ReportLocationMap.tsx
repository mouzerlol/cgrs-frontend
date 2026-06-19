'use client';

/**
 * Read-only overview map for a single ground report: plots one numbered marker per
 * photo so a manager can see, at a glance, where the report's photos were taken.
 * Marker numbers match the photo grid order. Reuses the same OSM tiles + community
 * centre as the rest of the site; the map auto-fits to the photo extent.
 */

import { useEffect, useRef } from 'react';
import BaseMap from '@/components/map/BaseMap';
import { getOSMTileUrl, getOSMTileOptions } from '@/lib/maps';
import { MAP_CENTER, MAP_ZOOM } from '@/data/map-data';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string | null;
}

interface ReportLocationMapProps {
  points: MapPoint[];
  /** Index (0-based) of a point to emphasise, e.g. the hovered photo. */
  activeIndex?: number | null;
  className?: string;
}

function markerIcon(L: typeof import('leaflet'), n: number, active: boolean): import('leaflet').DivIcon {
  const bg = active ? '#C74E2E' : '#D95D39';
  const size = active ? 28 : 24;
  return L.divIcon({
    className: '',
    html: `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;background:${bg};color:#F4F1EA;border:2px solid #F4F1EA;border-radius:9999px;font:600 12px/1 var(--font-jetbrains-mono),ui-monospace,monospace;box-shadow:0 2px 6px rgba(26,34,24,0.35)">${n}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function ReportLocationMap({ points, activeIndex, className }: ReportLocationMapProps) {
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const layerRef = useRef<import('leaflet').LayerGroup | null>(null);

  const render = async () => {
    const map = mapRef.current;
    if (!map) return;
    const L = (await import('leaflet')).default;
    if (!layerRef.current) layerRef.current = L.layerGroup().addTo(map);
    const layer = layerRef.current;
    layer.clearLayers();

    if (points.length === 0) {
      map.setView(MAP_CENTER, MAP_ZOOM - 1);
      return;
    }
    points.forEach((p, i) => {
      L.marker([p.lat, p.lng], { icon: markerIcon(L, i + 1, i === activeIndex) })
        .bindTooltip(p.label || `Photo ${i + 1}`, { direction: 'top', offset: [0, -12] })
        .addTo(layer);
    });
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    if (points.length === 1) {
      map.setView(bounds.getCenter(), Math.max(MAP_ZOOM, 16));
    } else {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 18 });
    }
  };

  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, activeIndex]);

  return (
    <div className={className} style={{ height: '100%', minHeight: 220 }} data-testid="report-location-map">
      <BaseMap
        center={MAP_CENTER}
        zoom={MAP_ZOOM - 1}
        tileUrl={getOSMTileUrl()}
        tileOptions={getOSMTileOptions()}
        showHomeControl={false}
        scrollWheelZoom={false}
        maxZoom={19}
        minZoom={12}
        onMapReady={(map) => {
          mapRef.current = map;
          render();
        }}
      />
    </div>
  );
}
