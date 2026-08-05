import { livingWallImageResponse } from '@/lib/og/living-wall';

/**
 * Open Graph image for /guidelines. The "Living Wall" card with the guideline glyph set
 * (communal, parking, behaviour, property, pets) and the locked variant-C plaque.
 * Static copy, so this is a plain GET with no params. `generateMetadata` on /guidelines
 * points its openGraph/twitter images here.
 */
export const runtime = 'nodejs';

export async function GET() {
  return livingWallImageResponse({
    set: 'guidelines',
    eyebrow: 'Coronation Gardens',
    headline: ['Community', 'Guidelines'],
  });
}
