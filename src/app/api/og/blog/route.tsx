import { type NextRequest } from 'next/server';
import { livingWallImageResponse } from '@/lib/og/living-wall';
import { getPost, isGatedSlug } from '@/lib/blog';
import { categoryLabel } from '@/components/blog/categories';

/**
 * Open Graph image for blog posts. `GET /api/og/blog?slug=` renders the shared
 * "Living Wall" card with the NEWS glyph set (newspaper, megaphone, quote,
 * signal, pen) and the post's title in the plaque. `generateMetadata` on
 * /blog/[slug] points here.
 *
 * Everything it draws comes from the manifest, so a card is available for any
 * published post without a deployment — the same property the page itself has.
 */
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  // The public manifest only, so a post gated to owners is never drawn — a share
  // card carries the title and the excerpt, which is most of what the gate is
  // for.
  const post = slug ? await getPost(slug) : null;

  if (!post) {
    /*
     * A gated slug is refused rather than given the fallback card. Both leave the
     * post undrawn, but the redirect says "this URL is wrong", and answering that
     * for a post that does exist would be misleading to the member who shared it.
     */
    if (slug && (await isGatedSlug(slug))) {
      return new Response('Not found', { status: 404 });
    }
    return Response.redirect(new URL('/images/og-default.jpg', req.nextUrl.origin), 307);
  }

  const date = new Date(post.date).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return livingWallImageResponse({
    set: 'news',
    // The vocabulary's label, falling back to whatever the manifest carries so a
    // post published before the vocabulary closed still draws a card.
    eyebrow: categoryLabel(post.categorySlug, post.categoryLabel) || 'Community News',
    headline: post.title,
    subhead: `${date} · ${post.author}`,
    footerGlyph: 'pen',
  });
}
