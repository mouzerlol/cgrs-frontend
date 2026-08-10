import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleContent from '@/components/blog/ArticleContent';
import { getBreadcrumbsJsonLd } from '@/lib/breadcrumbs';
import { getManifestOrNull, getPost, getPostWithBody, getRelatedPosts } from '@/lib/blog';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/** Meta descriptions are bounded; an excerpt may not be. */
function description(excerpt: string): string {
  return excerpt.length > 160 ? `${excerpt.slice(0, 157)}...` : excerpt;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Article Not Found | Coronation Gardens' };
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  const summary = description(post.excerpt);
  const ogImage = {
    url: `/api/og/blog?slug=${post.slug}`,
    width: 1200,
    height: 630,
    alt: `${post.title}, on the Coronation Gardens community noticeboard.`,
  };

  return {
    title: `${post.title} | Coronation Gardens`,
    description: summary,
    openGraph: {
      title: post.title,
      description: summary,
      type: 'article',
      images: [ogImage],
    },
    twitter: {
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

/**
 * Prerender what exists at build, and keep serving what does not.
 *
 * `dynamicParams` stays on, so a post published after the last deployment
 * renders on first request and is cached from there. The build only warms the
 * cache; it is never what makes a post reachable — which is why an unreachable
 * origin during a build yields an empty list rather than a failure.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const manifest = await getManifestOrNull();
  if (!manifest) return [];
  return manifest.posts.map((post) => ({ slug: post.slug }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const found = await getPostWithBody(slug);

  // A slug the manifest does not carry is a 404, whether it is a draft, an
  // unpublished post, or one of the removed placeholders. No redirects.
  if (!found) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(slug);

  return (
    <ArticleContent post={found.post} blocks={found.blocks} relatedPosts={relatedPosts} />
  );
}
