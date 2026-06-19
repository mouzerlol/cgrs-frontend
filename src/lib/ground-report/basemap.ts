/**
 * Mini-map basemap config for the reel.
 *
 * Rather than a raster export, the basemap is drawn once as an SVG of the
 * development's precinct polygons within fixed geographic bounds derived from the
 * community boundary. The image never pans or zooms; only the marker moves, placed
 * by projecting an image's lat/lng to a percentage via these bounds.
 */

import { BOUNDARY_COORDINATES, PRECINCTS } from '@/data/map-data';
import { projectToPercent, type GeoBounds } from '@/lib/ground-report/reel';

/** Pad the raw boundary box slightly so edge markers aren't clipped. */
function computeBounds(): GeoBounds {
  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;
  for (const [lng, lat] of BOUNDARY_COORDINATES as readonly (readonly [number, number])[]) {
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
  }
  const padLng = (east - west) * 0.06 || 0.001;
  const padLat = (north - south) * 0.06 || 0.001;
  return {
    west: west - padLng,
    east: east + padLng,
    south: south - padLat,
    north: north + padLat,
  };
}

export const GROUND_REPORT_BASEMAP_BOUNDS: GeoBounds = computeBounds();

export interface BasemapPolygon {
  id: string;
  /** SVG "x,y x,y …" points in a 0–100 viewBox. */
  points: string;
  fill: string;
  stroke: string;
}

/** The whole-development outline projected into the 0–100 viewBox ("x,y x,y …"). */
export function boundaryPoints(): string {
  return (BOUNDARY_COORDINATES as readonly (readonly [number, number])[])
    .map(([lng, lat]) => {
      const { xPct, yPct } = projectToPercent(lat, lng, GROUND_REPORT_BASEMAP_BOUNDS);
      return `${xPct.toFixed(2)},${yPct.toFixed(2)}`;
    })
    .join(' ');
}

/** Precinct polygons projected into the 0–100 viewBox for the static basemap SVG. */
export function basemapPolygons(): BasemapPolygon[] {
  return PRECINCTS.map((p) => ({
    id: p.id,
    points: p.coordinates
      .map(([lng, lat]) => {
        const { xPct, yPct } = projectToPercent(lat, lng, GROUND_REPORT_BASEMAP_BOUNDS);
        return `${xPct.toFixed(2)},${yPct.toFixed(2)}`;
      })
      .join(' '),
    fill: p.color,
    stroke: p.strokeColor,
  }));
}
