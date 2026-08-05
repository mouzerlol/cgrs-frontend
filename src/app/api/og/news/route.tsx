import { type NextRequest } from 'next/server';
import { livingWallImageResponse } from '@/lib/og/living-wall';
import newsData from '@/data/news.json';
import type { NewsArticle } from '@/types';

/**
 * Open Graph image for blog / news articles. `GET /api/og/news?slug=` renders the shared
 * "Living Wall" card with the NEWS glyph set (newspaper, megaphone, quote, signal, pen)
 * and the article title in the plaque. `generateMetadata` on /blog/[slug] points here.
 */
export const runtime = 'nodejs';

const CATEGORY_LABEL: Record<NewsArticle['category'], string> = {
  general: 'Community News',
  guidelines: 'Guidelines',
  events: 'Community News',
  maintenance: 'Maintenance',
  policy: 'Policy',
};

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const article = (newsData.articles as NewsArticle[]).find((a) => a.slug === slug);
  if (!article) return Response.redirect(new URL('/images/og-default.jpg', req.nextUrl.origin), 307);

  const date = new Date(article.date).toLocaleDateString('en-NZ', { day: 'numeric', month: 'long', year: 'numeric' });
  return livingWallImageResponse({
    set: 'news',
    eyebrow: CATEGORY_LABEL[article.category] ?? 'Community News',
    headline: article.title,
    subhead: `${date} · ${article.author}`,
    footerGlyph: 'pen',
  });
}
