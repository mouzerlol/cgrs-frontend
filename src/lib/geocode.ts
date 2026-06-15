/**
 * Reverse geocoding for shared map points, via Stadia (same account/key as the basemap).
 *
 * Server-only: it reads `STADIA_MAPS_API_KEY` and makes a network call, so it must never
 * be imported into a client bundle. It exists to answer one question the CGRS-local data
 * can't: "what suburb / street is this arbitrary point in?" — so a shared pin that lands
 * outside the development still names somewhere real instead of the Māngere Bridge floor.
 */

import { type LocationDescription, describeLocation } from '@/lib/share-location';

const ENDPOINT = 'https://api.stadiamaps.com/geocoding/v1/reverse';
/** Don't let a slow geocode hang a link unfurl; the card degrades to local data on timeout. */
const TIMEOUT_MS = 2500;

interface GeocodeResult {
  /** Suburb / locality, the recognisable "area name": "Onehunga", "Mount Roskill". */
  area?: string;
  /** Street name only, no house number (the point is approximate; a number would overstate it). */
  street?: string;
  /** Named venue or point of interest, when the point sits on one: "Interlink Modular". */
  venue?: string;
}

/** Stadia returns "Mangere Bridge"; render it with the macron to match the brand voice. */
function normalizeArea(area: string | undefined): string | undefined {
  if (!area) return undefined;
  return /^m[aā]ngere bridge$/i.test(area) ? 'Māngere Bridge' : area;
}

/**
 * Reverse-geocode a point to a suburb / street / venue. Returns null on any failure
 * (no key, timeout, network error, no result) so callers can fall back cleanly.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const apiKey = process.env.STADIA_MAPS_API_KEY;
  if (!apiKey) return null;

  const url = `${ENDPOINT}?point.lat=${lat}&point.lon=${lng}&size=1&api_key=${apiKey}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: 'force-cache' });
    if (!res.ok) return null;
    const data = await res.json();
    const p = data?.features?.[0]?.properties;
    if (!p) return null;

    const isVenue = p.layer === 'venue' || p.layer === 'poi';
    return {
      area: normalizeArea(p.locality || p.neighbourhood || p.localadmin),
      street: p.street || undefined,
      venue: isVenue ? p.name || undefined : undefined,
    };
  } catch {
    return null; // timeout / network / parse — degrade to local data
  }
}

/**
 * Full description of a shared point: CGRS-local precinct + address (precise, authoritative)
 * enriched with a reverse-geocoded suburb / street / venue for anything outside the
 * development. The local fields always win in the copy; the geocoded fields only fill gaps.
 */
export async function resolveShareLocation(lat: number, lng: number): Promise<LocationDescription> {
  const base = describeLocation(lat, lng);
  const geo = await reverseGeocode(lat, lng);
  return { ...base, area: geo?.area, street: geo?.street, venue: geo?.venue };
}
