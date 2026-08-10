import 'server-only';

import type { Block, BlockDocument, CategorySummary, Manifest, PostSummary } from './types';
import {
  BLOG_CACHE_TAG,
  MANIFEST_REVALIDATE_SECONDS,
  contentOrigin,
  objectUrl,
  type ContentOrigin,
} from './origin';

/**
 * The only module that reads the published content origin.
 *
 * No page, component, route handler, or test fetches a bucket object directly.
 * That is not tidiness — it is what makes "no public page render calls the API
 * or the database" a property of one file rather than a habit spread across
 * eleven.
 *
 * `server-only` enforces it at the module boundary: a client component that
 * imports this fails the build rather than shipping a fetch to the browser.
 */

/**
 * The last manifest that was fetched successfully.
 *
 * A failed refetch keeps serving this rather than surfacing an error, because a
 * transient blip on a public page is not worth an outage. Only a cold cache with
 * the origin unreachable produces a visible unavailable state, and that state is
 * contained to blog surfaces.
 */
let lastGoodManifest: Manifest | null = null;

/** The same, for the gated half. Separate because the two fail independently. */
let lastGoodMembersManifest: Manifest | null = null;

/** What a bucket with no gated posts looks like, and what a missing one is read as. */
const EMPTY_MANIFEST: Manifest = {
  schemaVersion: 2,
  generatedAt: '1970-01-01T00:00:00Z',
  posts: [],
  categories: [],
};

/** Raised only when nothing has ever been cached and the fetch failed. */
export class BlogContentUnavailableError extends Error {
  /** What actually failed, kept for the log rather than for the reader. */
  readonly reason: unknown;

  constructor(reason: unknown) {
    super('Blog content is unavailable.');
    this.name = 'BlogContentUnavailableError';
    this.reason = reason;
  }
}

async function fetchJson<T>(origin: ContentOrigin, key: string, revalidate: number | false): Promise<T> {
  const response = await fetch(objectUrl(origin, key), {
    next: revalidate === false ? { tags: [BLOG_CACHE_TAG] } : { revalidate, tags: [BLOG_CACHE_TAG] },
  });
  if (!response.ok) {
    throw new Error(`Content origin returned ${response.status} for ${key}`);
  }
  return (await response.json()) as T;
}

/**
 * Fetch `index.json`, degrading to the last good copy on failure.
 *
 * The manifest is load-bearing: a public bucket cannot be listed, so this is the
 * only way the site knows what exists.
 */
export async function getManifest(): Promise<Manifest> {
  try {
    // Inside the try because a missing `BLOG_CONTENT_ORIGIN` throws, and a
    // misconfigured environment should degrade the blog the same way an
    // unreachable bucket does rather than throw out of every page that asks.
    const origin = contentOrigin();
    const manifest = await fetchJson<Manifest>(origin, 'index.json', MANIFEST_REVALIDATE_SECONDS);
    lastGoodManifest = manifest;
    return manifest;
  } catch (error) {
    if (lastGoodManifest) {
      console.error('[blog] manifest refetch failed; serving the last good copy', error);
      return lastGoodManifest;
    }
    console.error('[blog] manifest fetch failed with nothing cached', error);
    throw new BlogContentUnavailableError(error);
  }
}

/**
 * The manifest, or null when content is unavailable.
 *
 * For call sites that have a degraded state to render — the listing, the
 * homepage section — as opposed to ones that should 404.
 */
export async function getManifestOrNull(): Promise<Manifest | null> {
  try {
    return await getManifest();
  } catch (error) {
    if (error instanceof BlogContentUnavailableError) return null;
    throw error;
  }
}

/**
 * `members-index.json`, or an empty manifest.
 *
 * Unlike the public manifest this never degrades into an error. A bucket written
 * by a publisher that predates the gate has no such object, and 404 there means
 * "no gated posts" rather than "content is unavailable" — failing the page over
 * a file that legitimately may not exist would take the whole blog down for
 * every signed-in member.
 *
 * Nothing calls this directly. It is reached only through `getManifestForViewer`
 * with the gate already decided, so no caller can accidentally read gated posts
 * without having established that the viewer may see them.
 */
async function getMembersManifest(): Promise<Manifest> {
  try {
    const origin = contentOrigin();
    const manifest = await fetchJson<Manifest>(
      origin,
      'members-index.json',
      MANIFEST_REVALIDATE_SECONDS
    );
    lastGoodMembersManifest = manifest;
    return manifest;
  } catch (error) {
    if (lastGoodMembersManifest) {
      console.error('[blog] members manifest refetch failed; serving the last good copy', error);
      return lastGoodMembersManifest;
    }
    console.error('[blog] members manifest unavailable; treating it as empty', error);
    return EMPTY_MANIFEST;
  }
}

/**
 * Whether a slug belongs to a gated post.
 *
 * For the surfaces that must refuse a gated slug outright rather than fall back
 * to whatever they do for an unknown one — the share-card route, which would
 * otherwise hand out a generic card and imply the URL is simply wrong.
 *
 * Discloses nothing: the answer is a boolean, and the caller's response to true
 * is to refuse.
 */
export async function isGatedSlug(slug: string): Promise<boolean> {
  const gated = await getMembersManifest();
  return gated.posts.some((post) => post.slug === slug);
}

/** Newest first, slug breaking ties — the order each manifest is written in. */
function byDateThenSlug(a: PostSummary, b: PostSummary): number {
  return b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug);
}

/** Category counts over a post list, ordered by count then label as the writer does. */
function deriveCategories(posts: PostSummary[]): CategorySummary[] {
  const counts = new Map<string, CategorySummary>();
  for (const post of posts) {
    if (!post.categorySlug) continue;
    const existing = counts.get(post.categorySlug);
    if (existing) existing.count += 1;
    else counts.set(post.categorySlug, { slug: post.categorySlug, label: post.categoryLabel, count: 1 });
  }
  return Array.from(counts.values()).sort(
    (a, b) => b.count - a.count || a.label.toLowerCase().localeCompare(b.label.toLowerCase())
  );
}

/**
 * What the viewer is entitled to see.
 *
 * The gate is a parameter of the read rather than a decision spread across the
 * pages: a route decides once whether this viewer passes, and every listing,
 * lookup, and 404 downstream follows from the manifest it gets back. A page
 * cannot forget to filter, because there is nothing to filter — a viewer who
 * does not pass is handed the public manifest, unchanged and untouched.
 *
 * `canSeeGated` has no default on purpose. Every caller states which it means.
 */
export async function getManifestForViewer(canSeeGated: boolean): Promise<Manifest | null> {
  const publicManifest = await getManifestOrNull();
  if (!canSeeGated || !publicManifest) return publicManifest;

  const gated = await getMembersManifest();
  if (gated.posts.length === 0) return publicManifest;

  const posts = [...publicManifest.posts, ...gated.posts].sort(byDateThenSlug);
  return {
    ...publicManifest,
    posts,
    // Recounted rather than concatenated: the same category appears in both
    // manifests, and two entries for one slug would draw two chips.
    categories: deriveCategories(posts),
  };
}

/** Every published post, newest first. Carries no body content. */
export async function listPosts(): Promise<PostSummary[]> {
  return (await getManifest()).posts;
}

/** Categories present in published content, ordered by post count then label. */
export async function listCategories(): Promise<CategorySummary[]> {
  return (await getManifest()).categories;
}

/**
 * A single post's metadata, or null when the manifest does not carry it.
 *
 * Public by default: a caller that does not mention the gate gets the public
 * surface, which is the safe way round for a default to fail.
 */
export async function getPost(slug: string, canSeeGated = false): Promise<PostSummary | null> {
  const manifest = await getManifestForViewer(canSeeGated);
  return manifest?.posts.find((post) => post.slug === slug) ?? null;
}

/**
 * A post's body.
 *
 * Fetched only when an article renders — a listing never asks for one. Bodies
 * are immutable under a content-hashed key, so they are cached indefinitely: a
 * changed post is a different key, not a stale object.
 */
export async function getPostBody(post: PostSummary): Promise<BlockDocument> {
  return fetchJson<BlockDocument>(contentOrigin(), post.bodyKey, false);
}

/**
 * A post's metadata and body together, or null when the slug is not published —
 * or is gated and this viewer does not pass, which the article page turns into
 * the same 404 either way.
 */
export async function getPostWithBody(
  slug: string,
  canSeeGated = false
): Promise<{ post: PostSummary; blocks: Block[] } | null> {
  const post = await getPost(slug, canSeeGated);
  if (!post) return null;
  const document = await getPostBody(post);
  return { post, blocks: document.blocks };
}

/**
 * Up to three other published posts, newest first.
 *
 * A post never relates to itself, and the section is omitted entirely when no
 * other post exists.
 */
export async function getRelatedPosts(
  slug: string,
  limit = 3,
  canSeeGated = false
): Promise<PostSummary[]> {
  const manifest = await getManifestForViewer(canSeeGated);
  if (!manifest) return [];
  return manifest.posts.filter((post) => post.slug !== slug).slice(0, limit);
}

/** The featured post for the homepage, or null when nothing is featured. */
export async function getFeaturedPosts(limit = 3): Promise<PostSummary[]> {
  const manifest = await getManifestOrNull();
  if (!manifest) return [];
  return manifest.posts.filter((post) => post.featured).slice(0, limit);
}

export type { Block, BlockDocument, CategorySummary, Manifest, PostSummary } from './types';
export { BLOG_CACHE_TAG, MANIFEST_REVALIDATE_SECONDS } from './origin';

/**
 * Reset the stale-serving cache. Tests only — the degraded states are otherwise
 * order-dependent, and a test that passes because a previous one warmed the
 * cache is proving nothing.
 */
export function __resetManifestCache(): void {
  lastGoodManifest = null;
  lastGoodMembersManifest = null;
}
