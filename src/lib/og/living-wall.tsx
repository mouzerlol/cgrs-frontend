import { ImageResponse } from 'next/og';

/**
 * Shared renderer for the CGRS "Living Wall" link-preview cards (WhatsApp, Messenger,
 * iMessage, Slack). One design, many surfaces: a five-glyph theme language tessellated
 * into a warm field, with a forest-light plaque punched through the centre (bone Fraunces
 * headline, terracotta eyebrow, bone hairline keyline) that mirrors the site nav + splash.
 *
 * Every share card route (guidelines, map, news, events, sustainability) calls
 * `livingWallImageResponse` with its own glyph set + copy, so all unfurls stay identical
 * in form and on-brand. Glyphs are baked to data-URI SVGs and rasterised by Satori as
 * <img>, since Satori has no CSS context for `currentColor`.
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

// CGRS palette (DESIGN.md). Bone floor, forest ink, terracotta the one voice.
const BONE = '#F4F1EA';
const FOREST_LIGHT = '#2C3E2D';
const TERRA = '#D95D39';
const SAGE = '#A8B5A0';
const AMBER = '#D4A05A';
const TILE_COLORS = [SAGE, AMBER, TERRA, FOREST_LIGHT];

const FONT_BASE = 'https://cdn.jsdelivr.net/fontsource/fonts';
const FONTS = [
  { name: 'Fraunces', weight: 400 as const, url: `${FONT_BASE}/fraunces@latest/latin-400-normal.ttf` },
  { name: 'Manrope', weight: 400 as const, url: `${FONT_BASE}/manrope@latest/latin-400-normal.ttf` },
  { name: 'Manrope', weight: 600 as const, url: `${FONT_BASE}/manrope@latest/latin-600-normal.ttf` },
  { name: 'JetBrains Mono', weight: 500 as const, url: `${FONT_BASE}/jetbrains-mono@latest/latin-500-normal.ttf` },
];

/** Fetch the TTFs Satori needs. Resilient: a font that fails to load is simply skipped. */
async function loadOgFonts() {
  const loaded = await Promise.allSettled(
    FONTS.map(async (f) => {
      const res = await fetch(f.url, { cache: 'force-cache' });
      if (!res.ok) throw new Error(`font ${f.name} ${f.weight}: ${res.status}`);
      return { name: f.name, weight: f.weight, style: 'normal' as const, data: await res.arrayBuffer() };
    })
  );
  return loaded.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
}

// ---------------------------------------------------------------------------
// Glyph registry. Each entry returns the inner SVG markup; `c` is the stroke colour,
// passed through only where an element needs a baked fill (no currentColor in Satori).
// ---------------------------------------------------------------------------
const GLYPHS: Record<string, (c: string) => string> = {
  // guidelines
  communal: () =>
    `<circle cx="8" cy="8.5" r="2.4"/><circle cx="16" cy="8.5" r="2.4"/><path d="M3.5 18.6c0-2.8 2-4.3 4.5-4.3s4.5 1.5 4.5 4.3"/><path d="M11.5 18.6c0-2.8 2-4.3 4.5-4.3s4.5 1.5 4.5 4.3"/>`,
  parking: () => `<rect x="4" y="4" width="16" height="16" rx="2.6"/><path d="M9.4 16.6V7.4h3.3a2.6 2.6 0 0 1 0 5.2H9.4"/>`,
  behaviour: (c) =>
    `<path d="M4.5 5.5h15v8.4h-9l-4 3.4v-3.4h-2z"/><circle cx="9" cy="9.7" r="0.95" fill="${c}" stroke="none"/><circle cx="12" cy="9.7" r="0.95" fill="${c}" stroke="none"/><circle cx="15" cy="9.7" r="0.95" fill="${c}" stroke="none"/>`,
  property: () => `<path d="M3.4 11.3 12 4.5l8.6 6.8"/><path d="M5.6 10v9.6h12.8V10"/><path d="M10 19.6v-5h4v5"/>`,
  pets: () =>
    `<ellipse cx="12" cy="15.6" rx="4.1" ry="3.2"/><circle cx="6.8" cy="11.4" r="1.55"/><circle cx="10" cy="8.7" r="1.65"/><circle cx="14" cy="8.7" r="1.65"/><circle cx="17.2" cy="11.4" r="1.55"/>`,

  // map
  pin: () => `<path d="M12 21.5c0-1 6-6.2 6-11.5a6 6 0 1 0-12 0c0 5.3 6 10.5 6 11.5z"/><circle cx="12" cy="10" r="2.4"/>`,
  compass: () => `<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2 13 13l-3.8 1.8L11 11z"/>`,
  route: () => `<circle cx="6.5" cy="6.5" r="1.9"/><circle cx="17.5" cy="17.5" r="1.9"/><path d="M6.8 8.5c0 4 11 1 11 7" stroke-dasharray="2.5 2.5"/>`,
  mountain: () => `<path d="M3 19 9 8.5l3.2 5.3 2.3-3.6L21 19z"/>`,
  estuary: () => `<path d="M3 8q3-3 6 0t6 0 6 0"/><path d="M3 12q3-3 6 0t6 0 6 0"/><path d="M3 16q3-3 6 0t6 0 6 0"/>`,

  // news
  newspaper: () => `<rect x="3" y="5" width="15" height="14" rx="1.5"/><path d="M18 8h2.5v9a2 2 0 0 1-2 2H6"/><path d="M6 9h6M6 12h6M6 15h4"/>`,
  megaphone: () => `<path d="M4 10v4h3l8 4V6l-8 4H4z"/><path d="M18 9a4 4 0 0 1 0 6"/>`,
  quote: () => `<path d="M6 8h4v4c0 2-1.4 3.4-4 4"/><path d="M14 8h4v4c0 2-1.4 3.4-4 4"/>`,
  signal: () => `<circle cx="7" cy="17" r="1.4"/><path d="M6 11.5a6.5 6.5 0 0 1 6.5 6.5"/><path d="M6 6.5a11.5 11.5 0 0 1 11.5 11.5"/>`,
  pen: () => `<path d="M5 19l1-4L16 5l3 3L9 18z"/><path d="M14 7l3 3"/>`,

  // events
  calendar: () => `<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8 3v4M16 3v4"/>`,
  clock: () => `<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>`,
  ticket: () => `<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M14 6.5v11" stroke-dasharray="2 2"/>`,

  // sustainability
  leaf: () => `<path d="M5 18C5 11 11 5 19 5c0 8-6 14-13 14a6 6 0 0 1-1-.1z"/><path d="M9 15c2-3 5-5 8-6"/>`,
  sprout: () => `<path d="M12 20v-7"/><path d="M12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/><path d="M12 11c0-3 2-5 5-5 0 3-2 5-5 5z"/>`,
  sun: () => `<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4"/>`,
  drop: () => `<path d="M12 4c3 4 5.5 7 5.5 10A5.5 5.5 0 0 1 6.5 14C6.5 11 9 8 12 4z"/>`,
  tree: () => `<path d="M12 21v-5"/><path d="M12 16c-3 0-5-2-5-5 0-4 5-9 5-9s5 5 5 9c0 3-2 5-5 5z"/>`,
};

export const GLYPH_SETS = {
  guidelines: ['communal', 'parking', 'behaviour', 'property', 'pets'],
  map: ['pin', 'compass', 'route', 'mountain', 'estuary'],
  news: ['newspaper', 'megaphone', 'quote', 'signal', 'pen'],
  events: ['calendar', 'clock', 'pin', 'ticket', 'communal'],
  eco: ['leaf', 'sprout', 'sun', 'drop', 'tree'],
} as const;

export type GlyphSet = keyof typeof GLYPH_SETS;

function glyphUri(key: string, color: string, strokeWidth: number, px: number): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${px}' height='${px}' viewBox='0 0 24 24' fill='none' stroke='${color}' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round'>${GLYPHS[key](color)}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** Step the Fraunces size down so long titles still fit the plaque on one or two lines. */
function headlineSize(h: string): number {
  const n = h.length;
  if (n > 52) return 38;
  if (n > 40) return 44;
  if (n > 30) return 50;
  if (n > 20) return 58;
  return 66;
}

export interface LivingWallOptions {
  set: GlyphSet;
  /** Terracotta uppercase eyebrow. */
  eyebrow?: string;
  /** Fraunces headline. A string auto-sizes + wraps; an array renders fixed large lines. */
  headline: string | string[];
  /** Manrope line under the headline. */
  subhead?: string;
  /** Mono footer text. */
  footer?: string;
  /** Optional glyph key shown in terracotta beside the footer. */
  footerGlyph?: string;
}

export async function livingWallImageResponse(opts: LivingWallOptions): Promise<ImageResponse> {
  const { set, eyebrow, headline, subhead, footer = 'cgrs.co.nz', footerGlyph } = opts;
  const fonts = await loadOgFonts();
  const keys = GLYPH_SETS[set];
  const tiles = Array.from({ length: 30 }, (_, i) => ({ key: keys[i % 5], color: TILE_COLORS[i % 4] }));

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BONE,
          fontFamily: 'Manrope',
        }}
      >
        {/* Tessellated glyph field */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: OG_SIZE.width, height: OG_SIZE.height, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
          {tiles.map((t, i) => (
            <div key={i} style={{ width: 200, height: 157.5, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.55 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={glyphUri(t.key, t.color, 1.4, 72)} width={72} height={72} alt="" />
            </div>
          ))}
        </div>

        {/* Forest-light plaque */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: 860,
            padding: '46px 60px',
            backgroundColor: FOREST_LIGHT,
            border: '1px solid rgba(244,241,234,0.28)',
            boxShadow: '0 24px 60px rgba(26,34,24,0.32)',
          }}
        >
          {eyebrow && (
            <div style={{ fontFamily: 'Manrope', fontWeight: 600, fontSize: 20, letterSpacing: '0.24em', textTransform: 'uppercase', color: TERRA, textAlign: 'center' }}>
              {eyebrow}
            </div>
          )}
          {Array.isArray(headline) ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 12 }}>
              {headline.map((line, i) => (
                <div key={i} style={{ fontFamily: 'Fraunces', fontWeight: 400, fontSize: 84, lineHeight: 0.96, letterSpacing: '-0.02em', color: BONE }}>
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', fontFamily: 'Fraunces', fontWeight: 400, fontSize: headlineSize(headline), lineHeight: 1.04, letterSpacing: '-0.02em', color: BONE, textAlign: 'center', marginTop: 12, maxWidth: 740 }}>
              {headline}
            </div>
          )}
          {subhead && (
            <div style={{ display: 'flex', fontFamily: 'Manrope', fontWeight: 400, fontSize: 24, color: BONE, opacity: 0.72, marginTop: 12, textAlign: 'center', maxWidth: 700 }}>
              {subhead}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
            {footerGlyph && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={glyphUri(footerGlyph, TERRA, 1.8, 22)} width={22} height={22} alt="" />
            )}
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 500, fontSize: 18, letterSpacing: '0.16em', color: BONE, opacity: 0.6 }}>
              {footer}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, immutable',
      },
    }
  );
}
