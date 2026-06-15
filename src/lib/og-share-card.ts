/**
 * Copy + static-map URL for the shared-location link-preview card.
 *
 * Framework-agnostic (no React, no `next/og`) so it can be unit-tested and reused by
 * both `generateMetadata` (the <head> text) and the `/api/og/share-location` route
 * (the image). The image route owns rendering; this module owns *what* it says.
 *
 * The guiding rule is never-empty: a dropped point that matches no precinct and sits
 * far from any known address (e.g. a visiting office) must still name *somewhere*.
 * Māngere Bridge is the floor; the card never falls back to "A shared location".
 */

import { type LocationDescription, placeLabel, PLACE_FLOOR } from '@/lib/share-location';

const SOCIETY = 'Coronation Gardens';

export interface ShareCardCopy {
  /** Uppercase terracotta eyebrow on the image. */
  eyebrow: string;
  /** Large Fraunces line on the image: the most specific place we can name. */
  headline: string;
  /** Manrope line under the headline: the next ring of context. */
  subhead: string;
  /** <title> + og:title. Carries the emoji pin the unfurl already used. */
  metaTitle: string;
  /** og:description. One line that says where, then why to tap. */
  metaDescription: string;
  /** og:image:alt — describes the rendered map for screen readers. */
  imageAlt: string;
}

/**
 * Resolve a described point into every string the card needs. The description may carry
 * CGRS-local fields (precinct, address) and/or reverse-geocoded fields (area, street,
 * venue); `resolvePlace` ranks them. A point with no data at all still names Māngere
 * Bridge — the card never falls back to a bare "A shared location".
 */
export function buildShareCardCopy(desc: LocationDescription): ShareCardCopy {
  const { name, detail, resolved } = placeLabel(desc);

  const headline = name;
  const subhead = detail ?? SOCIETY;
  // The name is already capitalised, so the subtitle reads cleanly as a title.
  const subtitle = detail ? `${name} · ${detail}` : resolved ? name : undefined;

  const metaTitle = `📍 ${subtitle ?? PLACE_FLOOR} — ${SOCIETY}`;

  // Description carries the why-tap, not a restate of the title (which already names the
  // place). It stays useful if a scraper shows it on its own.
  const metaDescription = resolved
    ? `Open this spot on the live community map for directions and what's nearby.`
    : `See exactly where this is in ${PLACE_FLOOR} on the live ${SOCIETY} community map.`;

  const imageAlt = `Map showing ${subtitle ?? `a shared location in ${PLACE_FLOOR}`}, on the ${SOCIETY} community map.`;

  return { eyebrow: 'A shared location', headline, subhead, metaTitle, metaDescription, imageAlt };
}

/** Brand terracotta, hex without the leading # (Stadia marker/colour params want it bare). */
const TERRACOTTA = 'd95d39';

export interface StadiaStaticMapOptions {
  lat: number;
  lng: number;
  apiKey: string;
  /** Final pixel width of the map band. Requested at @2x, so this is the displayed size. */
  width: number;
  /** Final pixel height of the map band. */
  height: number;
  /** Leaflet-equivalent zoom. 16 frames a street and its neighbours. */
  zoom?: number;
}

/**
 * Build the Stadia Static Maps URL for the point: Alidade Smooth (matching the live
 * map's intended style), centred on the coordinate with a terracotta brand marker.
 * Requested at @2x for retina sharpness, so width/height are the displayed dimensions.
 * Uses the cacheable endpoint since a rounded coordinate is a stable cache key.
 */
export function buildStadiaStaticMapUrl({
  lat,
  lng,
  apiKey,
  width,
  height,
  zoom = 16,
}: StadiaStaticMapOptions): string {
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    zoom: String(zoom),
    size: `${Math.round(width / 2)}x${Math.round(height / 2)}@2x`,
    api_key: apiKey,
  });
  // Marker syntax: lat,lon,style,color — empty style keeps the default pin shape.
  params.set('m', `${lat},${lng},,${TERRACOTTA}`);
  return `https://tiles.stadiamaps.com/static_cacheable/alidade_smooth.png?${params.toString()}`;
}
