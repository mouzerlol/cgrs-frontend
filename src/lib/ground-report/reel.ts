/**
 * Pure helpers for the member reel.
 *
 * The reel is a single flat slide list — a generated title slide per zone followed
 * by that zone's images — concatenated across active zones in a stable order. Plain
 * index arithmetic then gives "auto-roll into the next zone" and "loop at the end".
 *
 * The fixed mini-map projects an image's lat/lng to a pixel within the basemap's
 * known geographic bounds (no live map; only the marker moves).
 */

import type {
  MemberImageResponse,
  MemberZoneReportResponse,
} from '@/types/ground-report';

export interface TitleSlide {
  kind: 'title';
  zoneId: string;
  label: string;
  period: string;
  zoneIndex: number;
  /** Total active zones in the reel (for "Area 2 of 5"). */
  zoneTotal: number;
  /** This zone's cover photo, used as the title slide's full-bleed backdrop. */
  coverUrl: string | null;
  /** Number of photos in this zone (shown on the title card). */
  imageCount: number;
}

export interface ImageSlide {
  kind: 'image';
  zoneId: string;
  label: string;
  zoneIndex: number;
  image: MemberImageResponse;
}

export type ReelSlide = TitleSlide | ImageSlide;

export function formatZonePeriod(zone: MemberZoneReportResponse): string {
  const start = new Date(zone.period_start);
  if (zone.period_type === 'month') {
    return start.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  const end = new Date(zone.period_end);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  return `Week of ${fmt(start)} – ${fmt(end)}`;
}

/** Compose the flat slide list: [title(z0), …images(z0)…, title(z1), …]. */
export function buildSlides(zones: MemberZoneReportResponse[]): ReelSlide[] {
  const slides: ReelSlide[] = [];
  zones.forEach((zone, zoneIndex) => {
    const period = formatZonePeriod(zone);
    slides.push({
      kind: 'title',
      zoneId: zone.zone_id,
      label: zone.label,
      period,
      zoneIndex,
      zoneTotal: zones.length,
      coverUrl: zone.images[0]?.url ?? null,
      imageCount: zone.images.length,
    });
    for (const image of zone.images) {
      slides.push({ kind: 'image', zoneId: zone.zone_id, label: zone.label, zoneIndex, image });
    }
  });
  return slides;
}

/** Index of the title slide for a given zone id (for "seek to this zone"). */
export function titleSlideIndex(slides: ReelSlide[], zoneId: string): number {
  return slides.findIndex((s) => s.kind === 'title' && s.zoneId === zoneId);
}

/**
 * Map a drag offset to a navigation delta, in any direction.
 *
 * A swipe up or left advances (+1, next); down or right rewinds (-1, prev) —
 * the dominant axis (larger absolute offset) decides which gesture it was, so a
 * mostly-horizontal flick reads as left/right even with some vertical drift.
 * Returns 0 when neither axis clears `threshold` (a tap or a too-small nudge).
 */
export function resolveSwipe(
  offset: { x: number; y: number },
  threshold: number,
): -1 | 0 | 1 {
  const dominant = Math.abs(offset.x) >= Math.abs(offset.y) ? offset.x : offset.y;
  if (Math.abs(dominant) < threshold) return 0;
  // Negative offset = moved up/left = advance; positive = down/right = rewind.
  return dominant < 0 ? 1 : -1;
}

/** Advance/rewind with wrap-around (TikTok-endless loop). */
export function wrapIndex(index: number, length: number): number {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

/** A small virtualization window (current ± radius) over the slide list. */
export function windowIndices(current: number, length: number, radius = 1): number[] {
  const out: number[] = [];
  for (let d = -radius; d <= radius; d++) out.push(wrapIndex(current + d, length));
  return Array.from(new Set(out));
}

export interface GeoBounds {
  /** [south, west] and [north, east] in lat/lng. */
  south: number;
  west: number;
  north: number;
  east: number;
}

/**
 * Project a lat/lng to a {xPct, yPct} position (0–100) within a basemap of the
 * given bounds. Clamped so an out-of-bounds coordinate still renders on the edge.
 */
export function projectToPercent(
  lat: number,
  lng: number,
  bounds: GeoBounds,
): { xPct: number; yPct: number } {
  const lngSpan = bounds.east - bounds.west || 1;
  const latSpan = bounds.north - bounds.south || 1;
  const xPct = ((lng - bounds.west) / lngSpan) * 100;
  // Latitude increases upward, but pixel y increases downward → invert.
  const yPct = ((bounds.north - lat) / latSpan) * 100;
  const clamp = (v: number) => Math.max(0, Math.min(100, v));
  return { xPct: clamp(xPct), yPct: clamp(yPct) };
}
