import { type NextRequest } from 'next/server';
import { parseShareCoords, placeLabel } from '@/lib/share-location';
import { resolveShareLocation } from '@/lib/geocode';

/**
 * Client-facing name for a shared map point: `GET /api/geocode/share?lat=&lng=`.
 *
 * The on-map landing card runs in the browser and can't hold the Stadia key, so it calls
 * this route, which runs the *same* `resolveShareLocation` + `placeLabel` ladder the link
 * unfurl uses. One source of truth: a point is named identically on the card and the card
 * image. Returns `{ name, detail, resolved }`; `name` is never empty (Māngere Bridge floor).
 */
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const coords = parseShareCoords(sp.get('lat'), sp.get('lng'));
  if (!coords) {
    return Response.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const desc = await resolveShareLocation(coords.lat, coords.lng);
  const label = placeLabel(desc);

  return Response.json(label, {
    // A rounded coordinate is a stable key; let the browser and CDN hold the name.
    headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
  });
}
