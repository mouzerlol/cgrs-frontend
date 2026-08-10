import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleContent from '@/components/blog/ArticleContent';
import { getBreadcrumbsJsonLd } from '@/lib/breadcrumbs';
import { getPost, getPostWithBody, getRelatedPosts } from '@/lib/blog';
import { canViewGatedPosts } from '@/lib/blog/viewer';

/**
 * An article as a signed-in visitor sees it.
 *
 * Reached only by the rewrite in `middleware.ts`; the visitor's URL stays
 * `/blog/<slug>`. A viewer who does not pass the gate gets the same `notFound()`
 * a slug that was never published gets — deliberately identical, so the 404 does
 * not advertise that there is something here to be let into.
 */

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Meta descriptions are bounded; an excerpt may not be. */
function description(excerpt: string): string {
  return excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, await canViewGatedPosts());

  if (!post) {
    return { title: 'Article Not Found | Coronation Gardens' };
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  const summary = description(post.excerpt);
  const isGated = post.visibility === 'owners';

  /*
   * A gated post gets no share card and no place in an index. The card route
   * refuses gated slugs anyway, but pointing at it would still put the title and
   * excerpt into a link preview — which is exactly what the gate exists to stop.
   */
  const ogImage = {
    url: `/api/og/blog?slug=${post.slug}`,
    width: 1200,
    height: 630,
    alt: `${post.title}, on the Coronation Gardens community noticeboard.`,
  };

  return {
    title: `${post.title} | Coronation Gardens`,
    description: summary,
    // The whole route is off-index: `/blog/<slug>` is the canonical URL, and a
    // gated post should not be indexed under any URL at all.
    robots: { index: false, follow: false },
    openGraph: {
      title: post.title,
      description: summary,
      type: 'article',
      images: isGated ? [] : [ogImage],
    },
    twitter: isGated
      ? { card: 'summary' }
      : {
          card: 'summary_large_image',
          title: post.title,
          description: summary,
          images: [ogImage.url],
        },
    other: {
      'script[type="application/ld+json"]': JSON.stringify(getBreadcrumbsJsonLd(breadcrumbs)),
    },
  };
}

export default async function MembersArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const canSeeGated = await canViewGatedPosts();
  const found = await getPostWithBody(slug, canSeeGated);

  if (!found) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug, 3, canSeeGated);

  return <ArticleContent post={found.post} blocks={found.blocks} relatedPosts={relatedPosts} />;
}
