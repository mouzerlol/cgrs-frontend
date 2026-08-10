import type { Metadata } from 'next';
import BlogListing from '@/components/blog/BlogListing';
import BlogUnavailable from '@/components/blog/BlogUnavailable';
import { getManifestForViewer } from '@/lib/blog';
import { canViewGatedPosts } from '@/lib/blog/viewer';

/**
 * The blog listing as a signed-in visitor sees it.
 *
 * Never linked and never navigated to directly: middleware rewrites `/blog` here
 * when a session exists, so the visitor's URL stays `/blog` throughout. What this
 * route buys is the dynamic render — `/blog` itself stays static for crawlers and
 * signed-out visitors, which is most of the traffic.
 *
 * The role check happens here rather than in the rewrite. A route that is only
 * safe because of how it was reached stops being safe the first time somebody
 * edits a matcher.
 */

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  // This URL is an implementation detail of the gate. `/blog` is the canonical
  // listing and the one that belongs in an index.
  robots: { index: false, follow: false },
};

export default async function MembersBlogPage() {
  const manifest = await getManifestForViewer(await canViewGatedPosts());

  if (!manifest) return <BlogUnavailable />;

  return <BlogListing posts={manifest.posts} categories={manifest.categories} />;
}
