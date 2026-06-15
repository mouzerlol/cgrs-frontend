/**
 * Shared-location helpers for the map "share a point" feature.
 *
 * One route carries the shared point: `/map?lat=<num>&lng=<num>[&from=share]`.
 * These helpers are deliberately framework-agnostic (no React, no Leaflet) so the
 * same logic runs both server-side in `generateMetadata` (for link unfurls) and
 * client-side in the map (for the on-map share card + deep-link landing).
 *
 * Reserved for future use, intentionally NOT implemented here:
 *   - `z`      — a zoom level baked into the URL
 *   - `layers` — which map layers are visible (e.g. `layers=parking,bins`)
 * The parser ignores unknown params, so adding these later is non-breaking.
 */

import { PRECINCTS } from '@/data/map-data';
import { PROPERTY_DATA } from '@/data/property-addresses';

/** Maximum zoom a shared link lands on (matches the map's `maxZoom`). */
export const SHARE_MAX_ZOOM = 19;

/** Only addresses within this many metres of the point are named in the card/unfurl. */
const NEAREST_ADDRESS_METERS = 120;

/** Round a coordinate to 5 decimal places (~1.1 m) — tidy URLs, no false precision. */
export function roundCoord(n: number): number {
  return Math.round(n * 1e5) / 1e5;
}

export interface ShareCoords {
  lat: number;
  lng: number;
}

function toNumber(value: string | string[] | null | undefined): number | null {
  if (value == null) return null;
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw == null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse + validate a `lat`/`lng` pair from any source (Next searchParams object,
 * URLSearchParams.get(), raw strings). Returns null unless BOTH are present, numeric,
 * and in range — callers fall back to the default map view on null.
 */
export function parseShareCoords(
  lat: string | string[] | null | undefined,
  lng: string | string[] | null | undefined
): ShareCoords | null {
  const latN = toNumber(lat);
  const lngN = toNumber(lng);
  if (latN == null || lngN == null) return null;
  if (latN < -90 || latN > 90) return null;
  if (lngN < -180 || lngN > 180) return null;
  return { lat: latN, lng: lngN };
}

/**
 * Build the shareable path for a point. Returns a root-relative path; callers prefix
 * `window.location.origin` (client) or rely on `metadataBase` (server) for an
 * absolute URL. Coordinates are rounded so the copied link is tidy.
 */
export function buildShareUrl(
  lat: number,
  lng: number,
  opts: { from?: string } = {}
): string {
  const params = new URLSearchParams({
    lat: String(roundCoord(lat)),
    lng: String(roundCoord(lng)),
  });
  if (opts.from) params.set('from', opts.from);
  return `/map?${params.toString()}`;
}

// --- Reverse lookup: name a point by precinct + nearest address ---------------
// Precinct coordinates are stored as [lng, lat] rings (see map-data.ts), so the
// point is tested as [lng, lat] here too.

function pointInRing(pt: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Equirectangular metre distance between two [lat, lng] points — fine at this scale. */
function metersBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const meanLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  const dx = (bLng - aLng) * Math.cos(meanLat) * 111320;
  const dy = (bLat - aLat) * 110540;
  return Math.sqrt(dx * dx + dy * dy);
}

export interface LocationDescription {
  precinctId?: string;
  precinctName?: string;
  /** Full address of the nearest property, only if within ~120 m. */
  address?: string;
  // --- Optional reverse-geocoded context (populated by lib/geocode.ts, never by
  //     describeLocation itself, which stays pure and network-free). Used to name
  //     points that fall outside the CGRS precinct/property data. ---
  /** Suburb / locality from reverse geocoding: "Onehunga", "Mount Roskill". */
  area?: string;
  /** Street name (no number) from reverse geocoding. */
  street?: string;
  /** Named venue / POI the point sits on, from reverse geocoding. */
  venue?: string;
}

/**
 * Describe a shared point in resident-friendly terms: which precinct it falls in
 * (geometric containment) and the nearest street address (when close enough). Either
 * field may be absent — callers must render gracefully without them.
 */
export function describeLocation(lat: number, lng: number): LocationDescription {
  const result: LocationDescription = {};

  const containing = PRECINCTS.find((p) => pointInRing([lng, lat], p.coordinates));
  if (containing) {
    result.precinctId = containing.id;
    result.precinctName = containing.name;
  }

  let best: { address: string; dist: number } | null = null;
  for (const precinct of PROPERTY_DATA) {
    for (const addr of precinct.addresses) {
      const [aLat, aLng] = addr.coordinates;
      const dist = metersBetween(lat, lng, aLat, aLng);
      if (!best || dist < best.dist) best = { address: addr.fullAddress, dist };
    }
  }
  if (best && best.dist <= NEAREST_ADDRESS_METERS) {
    result.address = best.address;
  }

  return result;
}

/** Human-readable subtitle for the card/unfurl, e.g. "Whai Hua · near 12 Huri Street". */
export function locationSubtitle(desc: LocationDescription): string | undefined {
  const parts: string[] = [];
  if (desc.precinctName) parts.push(desc.precinctName);
  if (desc.address) parts.push(`near ${desc.address}`);
  return parts.length ? parts.join(' · ') : undefined;
}

/** The place this whole map belongs to: the never-empty floor for a point's name. */
export const PLACE_FLOOR = 'Māngere Bridge';

/** Street portion of a full address ("23 Huri Street, Māngere Bridge, Auckland" → "23 Huri Street"). */
function shortAddress(address: string): string {
  return address.split(',')[0].trim();
}

export interface PlaceLabel {
  /** The place to lead with. Never empty; falls back to Māngere Bridge. */
  name: string;
  /** The specifier under the name, never repeating it: "near 23 Huri Street". */
  detail?: string;
  /** False only when nothing at all resolved (selects floor/loading copy). */
  resolved: boolean;
}

/**
 * Collapse a description into a name + detail, in priority order. Shared by the link-unfurl
 * image (`buildShareCardCopy`) and the on-map landing card so both name a point identically.
 *
 *   name   — CGRS precinct (most meaningful) > geocoded suburb > geocoded venue > floor.
 *   detail — CGRS address (precise) > geocoded street > geocoded venue > geocoded suburb.
 *
 * Local CGRS fields always outrank reverse-geocoded ones; the geocoded fields only fill gaps.
 */
export function placeLabel(desc: LocationDescription): PlaceLabel {
  const { precinctName, address, area, street, venue } = desc;
  const name = precinctName ?? area ?? venue ?? PLACE_FLOOR;

  let detail: string | undefined;
  if (address) detail = `near ${shortAddress(address)}`;
  else if (street) detail = `near ${street}`;
  else if (venue && venue !== name) detail = venue;
  else if (area && area !== name) detail = area;

  return { name, detail, resolved: name !== PLACE_FLOOR || Boolean(detail) };
}
