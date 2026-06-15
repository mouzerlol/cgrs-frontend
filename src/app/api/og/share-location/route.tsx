import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';
import { parseShareCoords } from '@/lib/share-location';
import { resolveShareLocation } from '@/lib/geocode';
import { buildShareCardCopy, buildStadiaStaticMapUrl } from '@/lib/og-share-card';

/**
 * Per-coordinate Open Graph image for shared map points (WhatsApp / iMessage / Slack).
 *
 * `GET /api/og/share-location?lat=&lng=` renders a 1200x630 card: a real Alidade Smooth
 * basemap of the exact spot (terracotta brand marker, baked in by Stadia) above a
 * bone-paper bar that names the place in Fraunces. Scrapers run no JS and fetch this
 * once, so the URL is the only thing they see; `generateMetadata` on /map points here
 * with the same lat/lng.
 *
 * The file-convention `opengraph-image` can't read query params, which is why this is a
 * standalone route handler instead. Falls back to the static default image whenever the
 * coordinate is bad or the Stadia key is unset, so an unfurl never breaks.
 */
export const runtime = 'nodejs';

const WIDTH = 1200;
const HEIGHT = 630;
const MAP_HEIGHT = 448;

// CGRS palette (DESIGN.md). Bone is the floor; forest is the ink; terracotta is the one voice.
const BONE = '#F4F1EA';
const FOREST = '#1A2218';
const TERRACOTTA = '#D95D39';
const SAGE = '#A8B5A0';

const FONT_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts';
const FONTS = [
  { name: 'Fraunces', weight: 400 as const, url: `${FONT_BASE}/fraunces@latest/latin-400-normal.ttf` },
  { name: 'Manrope', weight: 400 as const, url: `${FONT_BASE}/manrope@latest/latin-400-normal.ttf` },
  { name: 'Manrope', weight: 600 as const, url: `${FONT_BASE}/manrope@latest/latin-600-normal.ttf` },
];

/** Fetch the TTFs Satori needs. Resilient: a font that fails to load is simply skipped. */
async function loadFonts() {
  const loaded = await Promise.allSettled(
    FONTS.map(async (f) => {
      const res = await fetch(f.url, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`font ${f.name} ${f.weight}: ${res.status}`);
      return { name: f.name, weight: f.weight, style: 'normal' as const, data: await res.arrayBuffer() };
    })
  );
  return loaded.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
}

/** Fetch the Stadia basemap and inline it as a data URI so Satori never has to fetch. */
async function loadMapDataUri(lat: number, lng: number, apiKey: string): Promise<string | null> {
  const url = buildStadiaStaticMapUrl({ lat, lng, apiKey, width: WIDTH, height: MAP_HEIGHT });
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:image/png;base64,${buf.toString('base64')}`;
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const coords = parseShareCoords(sp.get('lat'), sp.get('lng'));
  const apiKey = process.env.STADIA_MAPS_API_KEY;
  const fallback = new URL('/images/og-default.jpg', req.nextUrl.origin);

  // Defensive: generateMetadata only links here with valid coords + a key present.
  if (!coords || !apiKey) return Response.redirect(fallback, 307);

  const copy = buildShareCardCopy(await resolveShareLocation(coords.lat, coords.lng));
  const [mapDataUri, fonts] = await Promise.all([
    loadMapDataUri(coords.lat, coords.lng, apiKey),
    loadFonts(),
  ]);
  if (!mapDataUri) return Response.redirect(fallback, 307);

  return new ImageResponse(
    (
      <div style={{ display: 'flex', flexDirection: 'column', width: WIDTH, height: HEIGHT, backgroundColor: BONE }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mapDataUri} width={WIDTH} height={MAP_HEIGHT} style={{ objectFit: 'cover' }} alt="" />
        <div style={{ display: 'flex', width: WIDTH, height: 2, backgroundColor: SAGE }} />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            padding: '0 56px',
            backgroundColor: BONE,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 820 }}>
            <div
              style={{
                fontFamily: 'Manrope',
                fontWeight: 600,
                fontSize: 18,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: TERRACOTTA,
              }}
            >
              {copy.eyebrow}
            </div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 400, fontSize: 50, lineHeight: 1.05, color: FOREST, marginTop: 8 }}>
              {copy.headline}
            </div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 400, fontSize: 24, color: FOREST, opacity: 0.7, marginTop: 8 }}>
              {copy.subhead}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, marginLeft: 32 }}>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 400, fontSize: 22, lineHeight: 1.1, color: FOREST, textAlign: 'right' }}>
              Coronation
            </div>
            <div style={{ fontFamily: 'Fraunces', fontWeight: 400, fontSize: 22, lineHeight: 1.1, color: FOREST, textAlign: 'right' }}>
              Gardens
            </div>
            <div style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 14, letterSpacing: '0.1em', color: FOREST, opacity: 0.55, marginTop: 8 }}>
              cgrs.co.nz
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
      headers: {
        // Rounded coordinates are a stable key; let scrapers and the CDN hold it.
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    }
  );
}
