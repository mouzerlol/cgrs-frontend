'use client';

/**
 * Fixed mini-map for the reel (top-right). A static SVG of the precinct polygons;
 * only the marker moves — projected from the current image's lat/lng. The map never
 * pans or zooms on swipe. Title slides pass `coord = null`, hiding the marker.
 */

import { useMemo } from 'react';
import { basemapPolygons, boundaryPoints, GROUND_REPORT_BASEMAP_BOUNDS } from '@/lib/ground-report/basemap';
import { projectToPercent } from '@/lib/ground-report/reel';

interface ReelMiniMapProps {
  coord: { lat: number; lng: number } | null;
  className?: string;
}

export default function ReelMiniMap({ coord, className }: ReelMiniMapProps) {
  const polygons = useMemo(() => basemapPolygons(), []);
  const boundary = useMemo(() => boundaryPoints(), []);
  const marker = coord ? projectToPercent(coord.lat, coord.lng, GROUND_REPORT_BASEMAP_BOUNDS) : null;

  return (
    <div
      className={`group pointer-events-none relative aspect-square w-[30vw] max-w-[120px] overflow-hidden rounded-none border border-bone/50 bg-sage-light/65 shadow-dock backdrop-saturate-150 sm:w-[26vw] sm:max-w-[300px] ${className ?? ''}`}
      aria-hidden="true"
      data-testid="reel-mini-map"
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {polygons.map((p) => (
          <polygon
            key={p.id}
            points={p.points}
            fill={p.fill}
            fillOpacity={0.4}
            stroke={p.stroke}
            strokeWidth={0.6}
          />
        ))}
        {/* Whole-development outline drawn over the precincts. */}
        <polygon
          points={boundary}
          fill="none"
          stroke="#1A2218"
          strokeWidth={1.4}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {marker ? (
        <span
          className="absolute z-10 -translate-x-1/2 -translate-y-full transition-all duration-500 ease-out"
          style={{ left: `${marker.xPct}%`, top: `${marker.yPct}%` }}
          data-testid="reel-mini-map-marker"
        >
          {/* Soft sonar pulse under the pin echoes the brand's locating motif. */}
          <span className="absolute -bottom-1 left-1/2 -z-10 h-4 w-4 -translate-x-1/2 animate-pulse rounded-full bg-terracotta/40 blur-[2px]" />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#D95D39" stroke="#F4F1EA" strokeWidth="2" className="drop-shadow-[0_2px_3px_rgba(26,34,24,0.5)]">
            <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="#F4F1EA" stroke="none" />
          </svg>
        </span>
      ) : null}
    </div>
  );
}
