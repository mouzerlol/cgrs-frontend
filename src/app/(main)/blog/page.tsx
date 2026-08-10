import BlogListing from '@/components/blog/BlogListing';
import BlogUnavailable from '@/components/blog/BlogUnavailable';
import { getManifestOrNull } from '@/lib/blog';

/**
 * The listing reads the published manifest and nothing else — no API call, no
 * database query, no bundled content file.
 */
export default async function BlogPage() {
  const manifest = await getManifestOrNull();

  // Null means nothing has ever been cached and the origin is unreachable. That
  // is contained to this surface: every other page on the site renders normally.
  if (!manifest) return <BlogUnavailable />;

  // BlogListing owns the hero as well as the grid: the category filter sits
  // inside the hero card and shares the list's client state.
  return <BlogListing posts={manifest.posts} categories={manifest.categories} />;
}
