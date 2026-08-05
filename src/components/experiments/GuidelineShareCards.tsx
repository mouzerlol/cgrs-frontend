'use client';

import type { CSSProperties, ReactNode } from 'react';
import Card from '@/components/ui/Card';

/**
 * Link-preview (Open Graph) card concepts for the /guidelines page.
 *
 * WhatsApp and Messenger never render our HTML; they scrape the page, pull a
 * single 1200x630 og:image, and wrap it in their OWN chrome (title, description,
 * domain). So each "card" below IS that og:image. The dozen designs span the
 * DESIGN.md colour-strategy axis from Restrained (terracotta as the rare red
 * letter) to Drenched (the surface IS the colour), all type-led and sharing one
 * five-glyph icon language for the guideline themes.
 *
 * This is an exploration surface, parked in /design-experiments. Nothing here is
 * wired to /guidelines yet; the winner gets ported to a Satori route later,
 * mirroring src/app/api/og/share-location/route.tsx.
 */

// CGRS palette (DESIGN.md). Bone is the floor, forest the ink, terracotta the one voice.
const BONE = '#F4F1EA';
const BONE_LIGHT = '#FAF8F3';
const FOREST = '#1A2218';
const FOREST_LIGHT = '#2C3E2D';
const TERRA = '#D95D39';
const TERRA_DARK = '#C74E2E';
const SAGE = '#A8B5A0';
const SAGE_LITE = '#D4DFD0';
const SAGE_LIGHT = '#E8EDE6';
const AMBER = '#D4A05A';

const FR = 'var(--font-fraunces), Georgia, serif';
const MR = 'var(--font-manrope), system-ui, sans-serif';
const MO = 'var(--font-jetbrains-mono), ui-monospace, monospace';

const TITLE = 'Community Guidelines';
const DESC =
  'How we live well together in Coronation Gardens: shared spaces, parking, behaviour, property and pets.';
const DOMAIN = 'cgrs.co.nz';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// ---------------------------------------------------------------------------
// Shared five-glyph theme language
// ---------------------------------------------------------------------------

const GLYPH_PATHS: Record<string, ReactNode> = {
  communal: (
    <>
      <circle cx="8" cy="8.5" r="2.4" />
      <circle cx="16" cy="8.5" r="2.4" />
      <path d="M3.5 18.6c0-2.8 2-4.3 4.5-4.3s4.5 1.5 4.5 4.3" />
      <path d="M11.5 18.6c0-2.8 2-4.3 4.5-4.3s4.5 1.5 4.5 4.3" />
    </>
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.6" />
      <path d="M9.4 16.6V7.4h3.3a2.6 2.6 0 0 1 0 5.2H9.4" />
    </>
  ),
  behaviour: (
    <>
      <path d="M4.5 5.5h15v8.4h-9l-4 3.4v-3.4h-2z" />
      <circle cx="9" cy="9.7" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.7" r="0.95" fill="currentColor" stroke="none" />
      <circle cx="15" cy="9.7" r="0.95" fill="currentColor" stroke="none" />
    </>
  ),
  property: (
    <>
      <path d="M3.4 11.3 12 4.5l8.6 6.8" />
      <path d="M5.6 10v9.6h12.8V10" />
      <path d="M10 19.6v-5h4v5" />
    </>
  ),
  pets: (
    <>
      <ellipse cx="12" cy="15.6" rx="4.1" ry="3.2" />
      <circle cx="6.8" cy="11.4" r="1.55" />
      <circle cx="10" cy="8.7" r="1.65" />
      <circle cx="14" cy="8.7" r="1.65" />
      <circle cx="17.2" cy="11.4" r="1.55" />
    </>
  ),
};

const THEMES: Array<{ key: keyof typeof GLYPH_PATHS; label: string }> = [
  { key: 'communal', label: 'COMMUNAL' },
  { key: 'parking', label: 'PARKING' },
  { key: 'behaviour', label: 'BEHAVIOUR' },
  { key: 'property', label: 'PROPERTY' },
  { key: 'pets', label: 'PETS' },
];

function Glyph({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.6,
}: {
  name: keyof typeof GLYPH_PATHS;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {GLYPH_PATHS[name]}
    </svg>
  );
}

function GlyphIndex({
  color = FOREST,
  labelColor,
  size = 44,
  gap = 70,
  showLabels = true,
  strokeWidth = 1.6,
}: {
  color?: string;
  labelColor?: string;
  size?: number;
  gap?: number;
  showLabels?: boolean;
  strokeWidth?: number;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap }}>
      {THEMES.map((t) => (
        <div
          key={t.key}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
        >
          <Glyph name={t.key} size={size} color={color} strokeWidth={strokeWidth} />
          {showLabels && (
            <span style={{ fontFamily: MO, fontSize: 13, letterSpacing: '0.12em', color: labelColor ?? color, opacity: 0.85 }}>
              {t.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Grain({ opacity = 0.07, blend = 'overlay' as const }: { opacity?: number; blend?: CSSProperties['mixBlendMode'] }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: GRAIN,
        backgroundSize: '200px 200px',
        opacity,
        mixBlendMode: blend,
        pointerEvents: 'none',
      }}
    />
  );
}

function Eyebrow({ children, color = TERRA, size = 22 }: { children: ReactNode; color?: string; size?: number }) {
  return (
    <div style={{ fontFamily: MR, fontWeight: 600, fontSize: size, letterSpacing: '0.24em', textTransform: 'uppercase', color }}>
      {children}
    </div>
  );
}

// Every card paints onto this exact 1200x630 stage, then CardFrame scales it.
const STAGE: CSSProperties = {
  position: 'relative',
  width: 1200,
  height: 630,
  overflow: 'hidden',
  fontFamily: MR,
  color: FOREST,
};

// ---------------------------------------------------------------------------
// 01 — The Almanac Plate (Restrained)
// ---------------------------------------------------------------------------
function CardAlmanac() {
  return (
    <div style={{ ...STAGE, background: BONE }}>
      <div style={{ position: 'absolute', inset: 36, border: `2px solid ${SAGE}` }} />
      <div style={{ position: 'absolute', inset: 48, border: `1px solid ${SAGE}`, opacity: 0.55 }} />
      <div
        style={{
          position: 'absolute',
          inset: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '64px 72px',
        }}
      >
        <Eyebrow>Coronation Gardens &middot; Mangere Bridge</Eyebrow>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 118, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Community
          </div>
          <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 118, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
            Guidelines
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
          <div style={{ width: 80, height: 1, background: SAGE }} />
          <GlyphIndex size={38} gap={56} strokeWidth={1.5} />
        </div>
      </div>
      <Grain />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 02 — The Index Card / Ledger (Restrained)
// ---------------------------------------------------------------------------
function CardLedger() {
  return (
    <div style={{ ...STAGE, background: BONE_LIGHT, display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 64px',
          height: 92,
          background: SAGE_LIGHT,
          borderBottom: `1px solid ${SAGE}`,
        }}
      >
        <span style={{ fontFamily: MO, fontSize: 22, letterSpacing: '0.16em', color: FOREST }}>
          GUIDELINES &middot; 05 SECTIONS
        </span>
        <span style={{ fontFamily: MO, fontSize: 22, letterSpacing: '0.16em', color: FOREST, opacity: 0.6 }}>
          {DOMAIN}
        </span>
      </div>
      <div style={{ flex: 1, padding: '54px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Eyebrow>For everyone who lives here</Eyebrow>
          <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 76, lineHeight: 1, letterSpacing: '-0.015em', marginTop: 14 }}>
            How we live well together
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {THEMES.map((t, i) => (
            <div
              key={t.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 28,
                padding: '14px 0',
                borderTop: `1px solid ${SAGE}`,
                opacity: 0.95,
              }}
            >
              <span style={{ fontFamily: MO, fontSize: 22, color: TERRA, width: 44 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <Glyph name={t.key} size={36} color={FOREST} strokeWidth={1.6} />
              <span style={{ fontFamily: MR, fontWeight: 600, fontSize: 26, letterSpacing: '0.08em', color: FOREST }}>
                {t.label.charAt(0) + t.label.slice(1).toLowerCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 03 — The Red Letter (Restrained, the red letter made literal)
// ---------------------------------------------------------------------------
function CardRedLetter() {
  return (
    <div style={{ ...STAGE, background: BONE, display: 'flex', alignItems: 'center', gap: 56, padding: '0 80px' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: -22, border: `2px solid ${SAGE}` }} />
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 420, lineHeight: 0.78, color: TERRA }}>G</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Eyebrow>Coronation Gardens</Eyebrow>
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 96, lineHeight: 0.95, letterSpacing: '-0.02em' }}>
          Community
          <br />
          Guidelines
        </div>
        <div style={{ display: 'flex', gap: 28, marginTop: 18 }}>
          {THEMES.map((t) => (
            <Glyph key={t.key} name={t.key} size={40} color={FOREST} strokeWidth={1.5} />
          ))}
        </div>
      </div>
      <Grain />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 04 — The Noticeboard (Committed, made by neighbours)
// ---------------------------------------------------------------------------
function CardNoticeboard() {
  const rot = [-3.5, 2.5, -1.5, 3, -2.5];
  return (
    <div style={{ ...STAGE, background: SAGE_LIGHT }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(${SAGE} 1.4px, transparent 1.4px)`,
          backgroundSize: '34px 34px',
          opacity: 0.4,
        }}
      />
      <div style={{ position: 'absolute', top: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ background: BONE, padding: '22px 56px', boxShadow: '0 12px 30px rgba(26,34,24,0.12)', transform: 'rotate(-1.5deg)' }}>
          <Eyebrow>The Coronation Gardens noticeboard</Eyebrow>
          <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 70, lineHeight: 1, letterSpacing: '-0.015em', marginTop: 8 }}>
            Community Guidelines
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 64, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 28 }}>
        {THEMES.map((t, i) => (
          <div
            key={t.key}
            style={{
              position: 'relative',
              width: 168,
              height: 168,
              background: BONE_LIGHT,
              boxShadow: '0 10px 24px rgba(26,34,24,0.14)',
              transform: `rotate(${rot[i]}deg)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            <div style={{ position: 'absolute', top: 14, width: 16, height: 16, borderRadius: 9999, background: TERRA, boxShadow: '0 2px 4px rgba(26,34,24,0.3)' }} />
            <Glyph name={t.key} size={52} color={FOREST_LIGHT} strokeWidth={1.5} />
            <span style={{ fontFamily: MO, fontSize: 14, letterSpacing: '0.1em', color: FOREST }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 05 — The Civic Seal (Committed)
// ---------------------------------------------------------------------------
function CardSeal() {
  const cx = 180;
  const cy = 180;
  const r = 56;
  const positions = THEMES.map((_, i) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
  return (
    <div style={{ ...STAGE, background: BONE, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 64, padding: '0 90px' }}>
      <svg width="360" height="360" viewBox="0 0 360 360" style={{ flexShrink: 0 }}>
        <defs>
          <path id="sealRing" d="M180,180 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" fill="none" />
        </defs>
        <circle cx="180" cy="180" r="168" fill="none" stroke={FOREST} strokeWidth="2" />
        <circle cx="180" cy="180" r="148" fill="none" stroke={FOREST} strokeWidth="1" opacity="0.5" />
        <text fontFamily={MR} fontWeight={600} fontSize="18" letterSpacing="4" fill={FOREST}>
          <textPath href="#sealRing" startOffset="0%">
            CORONATION GARDENS RESIDENTS SOCIETY &middot; COMMUNITY GUIDELINES &middot;
          </textPath>
        </text>
        {positions.map((p, i) => (
          <g key={THEMES[i].key} transform={`translate(${p.x - 16.8},${p.y - 16.8}) scale(1.4)`} stroke={i === 0 ? TERRA : FOREST} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {GLYPH_PATHS[THEMES[i].key]}
          </g>
        ))}
        <circle cx={cx} cy={cy} r="7" fill={TERRA} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Eyebrow>Mangere Bridge</Eyebrow>
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 92, lineHeight: 0.94, letterSpacing: '-0.02em' }}>
          Community
          <br />
          Guidelines
        </div>
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: FOREST, opacity: 0.6, marginTop: 10 }}>
          {DOMAIN}
        </span>
      </div>
      <Grain opacity={0.06} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 06 — Forest Field (Committed, inverted chrome)
// ---------------------------------------------------------------------------
function CardForestField() {
  return (
    <div style={{ ...STAGE, background: FOREST, color: BONE, padding: '72px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Eyebrow color={TERRA}>Coronation Gardens Residents Society</Eyebrow>
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: BONE, opacity: 0.55 }}>{DOMAIN}</span>
      </div>
      <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 138, lineHeight: 0.92, letterSpacing: '-0.025em', color: BONE }}>
        Community
        <br />
        Guidelines
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 64 }}>
        <GlyphIndex color={AMBER} labelColor={BONE} size={44} gap={56} strokeWidth={1.6} />
      </div>
      <Grain opacity={0.1} blend="soft-light" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 07 — Grid of Five (Committed, contents page)
// ---------------------------------------------------------------------------
function CardGrid() {
  const tints = [BONE_LIGHT, SAGE_LIGHT, SAGE_LITE, 'rgba(212,160,90,0.18)', 'rgba(217,93,57,0.12)'];
  return (
    <div style={{ ...STAGE, background: BONE, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 64px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Eyebrow>Coronation Gardens</Eyebrow>
          <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 80, lineHeight: 0.96, letterSpacing: '-0.02em', marginTop: 10 }}>
            Community Guidelines
          </div>
        </div>
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: FOREST, opacity: 0.55 }}>{DOMAIN}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 0 }}>
        {THEMES.map((t, i) => (
          <div
            key={t.key}
            style={{
              flex: 1,
              background: tints[i],
              borderLeft: i === 0 ? 'none' : `1px solid ${SAGE}`,
              padding: '40px 28px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontFamily: MO, fontSize: 20, color: FOREST, opacity: 0.5 }}>{String(i + 1).padStart(2, '0')}</span>
            <Glyph name={t.key} size={56} color={FOREST} strokeWidth={1.5} />
            <span style={{ fontFamily: MR, fontWeight: 600, fontSize: 19, letterSpacing: '0.1em', color: FOREST }}>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 08 — Terracotta Banner (Committed to Drenched, strong horizon)
// ---------------------------------------------------------------------------
function CardBanner() {
  return (
    <div style={{ ...STAGE, background: BONE, display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: '0 0 64%', padding: '72px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Eyebrow>Coronation Gardens &middot; Mangere Bridge</Eyebrow>
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 116, lineHeight: 0.94, letterSpacing: '-0.025em', marginTop: 16 }}>
          Community
          <br />
          Guidelines
        </div>
      </div>
      <div
        style={{
          flex: 1,
          background: TERRA,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 80px',
        }}
      >
        <div style={{ display: 'flex', gap: 56 }}>
          {THEMES.map((t) => (
            <Glyph key={t.key} name={t.key} size={50} color={BONE} strokeWidth={1.7} />
          ))}
        </div>
        <span style={{ fontFamily: MO, fontSize: 22, letterSpacing: '0.16em', color: BONE }}>{DOMAIN}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 09 — The Big Glyph (Drenched-ish, iconographic silhouette)
// ---------------------------------------------------------------------------
function CardBigGlyph() {
  return (
    <div style={{ ...STAGE, background: BONE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width="560" height="560" viewBox="0 0 24 24" fill="none" stroke={FOREST} strokeWidth={0.6} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.92 }}>
        {GLYPH_PATHS.property}
      </svg>
      <div style={{ position: 'absolute', top: 64, left: 80 }}>
        <Eyebrow>Coronation Gardens</Eyebrow>
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 64, lineHeight: 0.96, letterSpacing: '-0.02em', marginTop: 8 }}>
          Community
          <br />
          Guidelines
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 64, right: 80, display: 'flex', alignItems: 'center', gap: 24 }}>
        {THEMES.filter((t) => t.key !== 'property').map((t) => (
          <Glyph key={t.key} name={t.key} size={40} color={TERRA} strokeWidth={1.6} />
        ))}
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: FOREST, opacity: 0.6 }}>{DOMAIN}</span>
      </div>
      <Grain opacity={0.06} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 10 — Terracotta Drench (Drenched, maximum chat-list pop)
// ---------------------------------------------------------------------------
function CardDrench() {
  return (
    <div style={{ ...STAGE, background: TERRA, color: BONE, padding: '60px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ position: 'absolute', inset: 40, border: `2px solid ${BONE}`, opacity: 0.55 }} />
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 18px' }}>
        <Eyebrow color={BONE}>Coronation Gardens Residents Society</Eyebrow>
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: BONE, opacity: 0.85 }}>{DOMAIN}</span>
      </div>
      <div style={{ position: 'relative', textAlign: 'center', fontFamily: FR, fontWeight: 400, fontSize: 142, lineHeight: 0.9, letterSpacing: '-0.025em', color: BONE }}>
        Community
        <br />
        Guidelines
      </div>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', gap: 70, padding: '0 18px' }}>
        {THEMES.map((t) => (
          <Glyph key={t.key} name={t.key} size={48} color={BONE} strokeWidth={1.7} />
        ))}
      </div>
      <Grain opacity={0.12} blend="soft-light" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 11 — Risograph Overprint (Loud, printmaking craft)
// ---------------------------------------------------------------------------
function CardRiso() {
  return (
    <div style={{ ...STAGE, background: BONE, padding: '70px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <Eyebrow>Coronation Gardens &middot; Mangere Bridge</Eyebrow>
      <div style={{ position: 'relative' }}>
        <div
          aria-hidden
          style={{ position: 'absolute', left: 7, top: 7, fontFamily: FR, fontWeight: 400, fontSize: 128, lineHeight: 0.9, letterSpacing: '-0.025em', color: TERRA, mixBlendMode: 'multiply' }}
        >
          Community
          <br />
          Guidelines
        </div>
        <div style={{ position: 'relative', fontFamily: FR, fontWeight: 400, fontSize: 128, lineHeight: 0.9, letterSpacing: '-0.025em', color: FOREST }}>
          Community
          <br />
          Guidelines
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', gap: 44 }}>
          {THEMES.map((t) => (
            <div key={t.key} style={{ position: 'relative', width: 50, height: 50 }}>
              <div style={{ position: 'absolute', left: 4, top: 4, mixBlendMode: 'multiply' }}>
                <Glyph name={t.key} size={50} color={TERRA} strokeWidth={1.7} />
              </div>
              <Glyph name={t.key} size={50} color={FOREST} strokeWidth={1.7} />
            </div>
          ))}
        </div>
        <span style={{ fontFamily: MO, fontSize: 20, letterSpacing: '0.14em', color: FOREST, opacity: 0.6 }}>{DOMAIN}</span>
      </div>
      <Grain opacity={0.14} blend="multiply" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 12 — The Living Wall (Loud to Drenched, ordered maximalism)
// The centre plaque is parametrised so the forest-chrome treatment (bone text on
// a forest surface, mirroring the nav + splash) can be compared against variants.
// ---------------------------------------------------------------------------
type PlaqueStyle = {
  id: string;
  label: string;
  bg: string;
  text: string;
  eyebrow: string;
  border?: string;
  dimField?: boolean;
};

const PLAQUES: PlaqueStyle[] = [
  { id: 'forest-light', label: 'Forest-light surface, bone text, terracotta eyebrow', bg: FOREST_LIGHT, text: BONE, eyebrow: TERRA },
  { id: 'forest-deep', label: 'Forest (deep nav ink), bone text', bg: FOREST, text: BONE, eyebrow: TERRA },
  { id: 'forest-light-keyline', label: 'Forest-light, bone hairline keyline', bg: FOREST_LIGHT, text: BONE, eyebrow: TERRA, border: 'rgba(244,241,234,0.28)' },
  { id: 'forest-light-amber', label: 'Forest-light, amber eyebrow (warm on dark)', bg: FOREST_LIGHT, text: BONE, eyebrow: AMBER, dimField: true },
];

function CardLivingWall({ plaque = PLAQUES[0] }: { plaque?: PlaqueStyle }) {
  const tileColors = [SAGE, AMBER, TERRA, FOREST_LIGHT];
  return (
    <div style={{ ...STAGE, background: BONE }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} style={{ width: 200, height: 157.5, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.55 }}>
            <Glyph name={THEMES[i % 5].key} size={72} color={tileColors[i % 4]} strokeWidth={1.4} />
          </div>
        ))}
      </div>
      {plaque.dimField && <div style={{ position: 'absolute', inset: 0, background: BONE, opacity: 0.35 }} />}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 680,
          padding: '52px 60px',
          background: plaque.bg,
          border: plaque.border ? `1px solid ${plaque.border}` : 'none',
          boxShadow: '0 24px 60px rgba(26,34,24,0.32)',
          textAlign: 'center',
        }}
      >
        <Eyebrow color={plaque.eyebrow}>Coronation Gardens</Eyebrow>
        <div style={{ fontFamily: FR, fontWeight: 400, fontSize: 88, lineHeight: 0.94, letterSpacing: '-0.02em', marginTop: 12, color: plaque.text }}>
          Community
          <br />
          Guidelines
        </div>
        <span style={{ fontFamily: MO, fontSize: 19, letterSpacing: '0.16em', color: plaque.text, opacity: 0.55, display: 'block', marginTop: 18 }}>
          {DOMAIN}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Variant registry
// ---------------------------------------------------------------------------

type Spectrum = 'Restrained' | 'Committed' | 'Drenched' | 'Loud';

const SPECTRUM_STYLE: Record<Spectrum, { bg: string; fg: string }> = {
  Restrained: { bg: SAGE_LIGHT, fg: FOREST },
  Committed: { bg: 'rgba(212,160,90,0.22)', fg: '#7A5A1E' },
  Drenched: { bg: 'rgba(217,93,57,0.16)', fg: TERRA_DARK },
  Loud: { bg: FOREST, fg: BONE },
};

const VARIANTS: Array<{ id: string; name: string; spectrum: Spectrum; concept: string; Card: () => ReactNode }> = [
  { id: 'almanac', name: 'The Almanac Plate', spectrum: 'Restrained', concept: 'Double sage hairline frame, centred Fraunces masthead, the five themes as a quiet index along the foot. The purest editorial-almanac read; terracotta only in the eyebrow.', Card: CardAlmanac },
  { id: 'ledger', name: 'The Ledger', spectrum: 'Restrained', concept: 'A filed reference card. Mono section header, ruled rows, numbered themes with glyphs. Terracotta touches only the section numbers. Civic, archival, trustworthy.', Card: CardLedger },
  { id: 'red-letter', name: 'The Red Letter', spectrum: 'Restrained', concept: 'The hand-set red letter made literal: one illuminated terracotta G inside a sage frame, title set beside it. One voice, used loud but used once.', Card: CardRedLetter },
  { id: 'noticeboard', name: 'The Noticeboard', spectrum: 'Committed', concept: 'A community pinboard. Five themes as pinned bone notes with terracotta push-pins on a dotted sage field, title on a torn-paper banner. Made by neighbours.', Card: CardNoticeboard },
  { id: 'seal', name: 'The Civic Seal', spectrum: 'Committed', concept: 'Concentric type ring wrapping a rosette of the five glyphs, terracotta at twelve o’clock and a terracotta core. Official enough to trust, warm enough to return to.', Card: CardSeal },
  { id: 'forest-field', name: 'Forest Field', spectrum: 'Committed', concept: 'The management inversion turned outward: forest surface, bone masthead, amber glyph index. High contrast that pops in a busy chat list while staying on-brand.', Card: CardForestField },
  { id: 'grid', name: 'Grid of Five', spectrum: 'Committed', concept: 'A contents page. Five tonal columns (bone, sage, amber, terracotta tints), each a numbered theme. Systematic, calm, scannable even at thumbnail size.', Card: CardGrid },
  { id: 'banner', name: 'Terracotta Banner', spectrum: 'Drenched', concept: 'A hard horizon: bone masthead above, a terracotta band below carrying the glyphs in bone line-art. Strong silhouette, breaks the One Voice Rule on purpose.', Card: CardBanner },
  { id: 'big-glyph', name: 'The Big Glyph', spectrum: 'Drenched', concept: 'One oversized house mark fills the surface in fine forest line-art; title tucked top-left, supporting glyphs bottom-right. A memorable silhouette at any scale.', Card: CardBigGlyph },
  { id: 'drench', name: 'Terracotta Drench', spectrum: 'Drenched', concept: 'The surface IS the colour. Full terracotta, bone masthead reversed inside a bone keyline, glyph frieze beneath. Maximum pop in a chat preview list.', Card: CardDrench },
  { id: 'riso', name: 'Risograph Overprint', spectrum: 'Loud', concept: 'A two-colour misregistered print: terracotta and forest overprint on bone with heavy grain, glyphs doubled with offset channels. Visible human craft.', Card: CardRiso },
  { id: 'living-wall', name: 'The Living Wall', spectrum: 'Loud', concept: 'The glyph language tessellated into a warm patterned field, a forest plaque punched through the centre for the title. Bone text on forest mirrors the nav and splash chrome. Maximal, but ordered.', Card: () => <CardLivingWall plaque={PLAQUES[0]} /> },
];

// ---------------------------------------------------------------------------
// Render harness: scale the 1200x630 stage, wrap in platform chrome
// ---------------------------------------------------------------------------

const CARD_W = 360;

function CardFrame({ children, width = CARD_W, radius = 0 }: { children: ReactNode; width?: number; radius?: number }) {
  const scale = width / 1200;
  return (
    <div style={{ width, height: Math.round((width * 630) / 1200), overflow: 'hidden', borderRadius: radius }}>
      <div style={{ width: 1200, height: 630, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
    </div>
  );
}

const clamp = (lines: number): CSSProperties => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

function WhatsAppBubble({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#efeae2', padding: 22, borderRadius: 12 }}>
      <div style={{ maxWidth: 392, marginLeft: 'auto' }}>
        <div style={{ background: '#d9fdd3', borderRadius: 10, padding: 4, boxShadow: '0 1px 1px rgba(11,20,26,0.13)' }}>
          <div style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 8, overflow: 'hidden' }}>
            <CardFrame>{children}</CardFrame>
            <div style={{ padding: '8px 10px 10px' }}>
              <div style={{ ...clamp(2), fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 600, color: '#111b21', lineHeight: 1.3 }}>{TITLE}</div>
              <div style={{ ...clamp(2), fontFamily: 'system-ui, sans-serif', fontSize: 12.5, color: '#667781', lineHeight: 1.35, marginTop: 2 }}>{DESC}</div>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 12.5, color: '#667781', marginTop: 4 }}>{DOMAIN}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, padding: '4px 8px 2px' }}>
            <span style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, color: '#667781' }}>11:32</span>
            <span style={{ fontSize: 11, color: '#53bdeb' }}>{'✓✓'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessengerBubble({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#ffffff', padding: 22, borderRadius: 12, border: '1px solid #e4e6eb' }}>
      <div style={{ maxWidth: 360 }}>
        <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid #e4e6eb', background: '#fff' }}>
          <CardFrame>{children}</CardFrame>
          <div style={{ background: '#f0f2f5', padding: '10px 12px' }}>
            <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#65676b' }}>{DOMAIN}</div>
            <div style={{ ...clamp(2), fontFamily: 'system-ui, sans-serif', fontSize: 14, fontWeight: 600, color: '#050505', lineHeight: 1.3, marginTop: 2 }}>{TITLE}</div>
            <div style={{ ...clamp(1), fontFamily: 'system-ui, sans-serif', fontSize: 12.5, color: '#65676b', lineHeight: 1.35, marginTop: 2 }}>{DESC}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlatformLabel({ name, dot }: { name: string; dot: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span style={{ width: 10, height: 10, borderRadius: 9999, background: dot, display: 'inline-block' }} />
      <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-forest/60">{name}</span>
    </div>
  );
}

function RawCard({ children, width = 520 }: { children: ReactNode; width?: number }) {
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 22px rgba(26,34,24,0.10)', border: `1px solid ${SAGE}`, width }}>
      <CardFrame width={width}>{children}</CardFrame>
    </div>
  );
}

function LivingWallIterations() {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-display text-xl text-forest">Iteration &middot; The Living Wall plaque</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-terracotta/20 text-terracotta">In review</span>
      </div>
      <p className="text-sm text-forest/70 max-w-3xl mb-6">
        The centre plaque moves from bone paper to a <strong>forest surface with bone text</strong>, echoing the top nav and the
        splash headline. Four treatments below: the literal request, a deeper nav-ink variant, a hairline keyline, and an
        amber-eyebrow warm option (with the field dimmed so the plaque carries).
      </p>

      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        {PLAQUES.map((pl, i) => (
          <div key={pl.id}>
            <div className="mb-2 flex items-baseline gap-2">
              <span className="font-mono text-xs text-terracotta">{String.fromCharCode(65 + i)}</span>
              <span className="font-mono text-[0.6875rem] uppercase tracking-wider text-forest/60">{pl.id}</span>
            </div>
            <RawCard>{<CardLivingWall plaque={pl} />}</RawCard>
            <p className="mt-2 text-xs text-forest/55 leading-snug">{pl.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-sage/30">
        <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-forest/60 mb-4">
          Leading pick (A) in context
        </p>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <PlatformLabel name="WhatsApp" dot="#25d366" />
            <WhatsAppBubble>{<CardLivingWall plaque={PLAQUES[0]} />}</WhatsAppBubble>
          </div>
          <div>
            <PlatformLabel name="Messenger" dot="#0084ff" />
            <MessengerBubble>{<CardLivingWall plaque={PLAQUES[0]} />}</MessengerBubble>
          </div>
        </div>
      </div>
    </Card>
  );
}

function SpectrumBadge({ spectrum }: { spectrum: Spectrum }) {
  const s = SPECTRUM_STYLE[spectrum];
  return (
    <span style={{ background: s.bg, color: s.fg }} className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium tracking-wide">
      {spectrum}
    </span>
  );
}

export default function GuidelineShareCards() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-display text-2xl">Guideline Share Cards</h2>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-terracotta/20 text-terracotta">
            Exploration
          </span>
        </div>
        <p className="text-sm opacity-70 max-w-3xl">
          Twelve Open Graph / link-preview concepts for the <code className="font-mono">/guidelines</code> page. WhatsApp and
          Messenger never render our HTML; they scrape the page, take one <strong>1200&times;630</strong> image, and wrap it in
          their own title / description / domain chrome. So each card below <em>is</em> that image, shown inside a faithful mock
          of both apps. Every concept is type-led and shares one five-glyph language for the guideline themes.
        </p>
        <div className="mt-5 flex items-center gap-8 rounded-lg bg-bone-light border border-sage/30 px-5 py-4">
          {THEMES.map((t) => (
            <div key={t.key} className="flex flex-col items-center gap-1.5">
              <Glyph name={t.key} size={28} color={FOREST} strokeWidth={1.6} />
              <span className="font-mono text-[0.625rem] tracking-wider text-forest/70">{t.label}</span>
            </div>
          ))}
          <span className="ml-auto text-xs text-forest/55 max-w-[180px] leading-snug">
            Shared icon system: communal, parking, behaviour, property, pets.
          </span>
        </div>
        <p className="mt-4 text-xs opacity-60">
          Spectrum runs <strong>Restrained</strong> (terracotta as the rare red letter) to{' '}
          <strong>Drenched / Loud</strong> (the surface is the colour). The winner ports to a Satori route mirroring{' '}
          <code className="font-mono">src/app/api/og/share-location/route.tsx</code>.
        </p>
      </Card>

      {/* Active iteration: The Living Wall plaque */}
      <LivingWallIterations />

      {/* The dozen */}
      {VARIANTS.map((v, i) => (
        <Card key={v.id} className="p-6">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-sm text-terracotta">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display text-xl text-forest">{v.name}</h3>
            </div>
            <SpectrumBadge spectrum={v.spectrum} />
          </div>
          <p className="text-sm text-forest/70 max-w-3xl mb-6">{v.concept}</p>

          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <PlatformLabel name="WhatsApp" dot="#25d366" />
              <WhatsAppBubble>{<v.Card />}</WhatsAppBubble>
            </div>
            <div>
              <PlatformLabel name="Messenger" dot="#0084ff" />
              <MessengerBubble>{<v.Card />}</MessengerBubble>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
