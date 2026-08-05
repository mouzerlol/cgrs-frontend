import { type NextRequest } from 'next/server';
import { parseShareCoords } from '@/lib/share-location';
import { resolveShareLocation } from '@/lib/geocode';
import { buildShareCardCopy } from '@/lib/og-share-card';
import { livingWallImageResponse } from '@/lib/og/living-wall';

/**
 * Per-coordinate Open Graph image for shared map points (WhatsApp / iMessage / Slack).
 *
 * `GET /api/og/share-location?lat=&lng=` renders the shared "Living Wall" card with the
 * MAP glyph set (pin, compass, route, mountain, estuary) and the actual point's name in
 * the forest plaque. Mountain + estuary lean on the Māngere Bridge identity. Needs no
 * basemap or API key, so the unfurl never depends on an external fetch; the recipient
 * taps through to the live map. `generateMetadata` on /map points here with the lat/lng.
 */
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const coords = parseShareCoords(req.nextUrl.searchParams.get('lat'), req.nextUrl.searchParams.get('lng'));
  // Defensive: generateMetadata only links here with valid coords.
  if (!coords) return Response.redirect(new URL('/images/og-default.jpg', req.nextUrl.origin), 307);

  const copy = buildShareCardCopy(await resolveShareLocation(coords.lat, coords.lng));
  return livingWallImageResponse({
    set: 'map',
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    subhead: copy.subhead,
    footerGlyph: 'pin',
  });
}
