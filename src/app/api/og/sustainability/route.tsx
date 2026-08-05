import { livingWallImageResponse } from '@/lib/og/living-wall';

/**
 * Open Graph image for the /sustainability page. The shared "Living Wall" card with the
 * eco glyph set (leaf, sprout, sun, drop, tree). Static copy; `generateMetadata` on
 * /sustainability points its openGraph/twitter images here.
 */
export const runtime = 'nodejs';

export async function GET() {
  return livingWallImageResponse({
    set: 'eco',
    eyebrow: 'A note from CGRS',
    headline: 'When we sleep, and why we chose to.',
    subhead: 'Coronation Gardens',
    footerGlyph: 'leaf',
  });
}
