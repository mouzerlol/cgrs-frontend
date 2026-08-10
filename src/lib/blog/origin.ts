/**
 * Where published content is read from.
 *
 * One origin per environment, supplied by configuration rather than constructed
 * anywhere in the application, so the same code serves production, local
 * development, and tests.
 *
 *   BLOG_CONTENT_ORIGIN=https://content.cgrs.co.nz     deployed
 *   BLOG_CONTENT_ORIGIN=http://minio:9000/cgrs-blog-dev  local development
 *
 * There is no offline mode and no bundled content. A checked-in fixture origin
 * used to be the default when this was unset, which meant four invented posts
 * shipped inside every production bundle and would have rendered as real
 * articles on any deployment that lost the variable. Publishing works locally
 * against MinIO, so the fixtures were paying rent for a capability that already
 * exists — and the failure mode they left behind was a silent one.
 *
 * Unset is therefore a misconfiguration rather than a mode: `contentOrigin`
 * throws, `getManifest` turns that into the same unavailable state an
 * unreachable bucket produces, and the blog surfaces degrade visibly.
 */

export const BLOG_CACHE_TAG = 'blog-manifest';

/**
 * How long a fetched manifest is served before it is refetched.
 *
 * Correctness rests on this window alone. The revalidation signal from the API
 * only shortens the delay, so a signal that never arrives costs freshness and
 * nothing else.
 */
export const MANIFEST_REVALIDATE_SECONDS = 60;

export interface ContentOrigin {
  baseUrl: string;
}

/** Raised when `BLOG_CONTENT_ORIGIN` is missing. Caught into the unavailable state. */
export class BlogOriginNotConfiguredError extends Error {
  constructor() {
    super('BLOG_CONTENT_ORIGIN is not configured.');
    this.name = 'BlogOriginNotConfiguredError';
  }
}

/**
 * The configured origin.
 *
 * Read at call time rather than captured at module load, so a test can point the
 * reading path somewhere else without reloading the module graph.
 */
export function contentOrigin(): ContentOrigin {
  const configured = (process.env.BLOG_CONTENT_ORIGIN ?? '').trim();
  if (!configured) throw new BlogOriginNotConfiguredError();

  return { baseUrl: configured.replace(/\/+$/, '') };
}

/** Absolute URL for an object key. */
export function objectUrl(origin: ContentOrigin, key: string): string {
  return `${origin.baseUrl}/${key.replace(/^\/+/, '')}`;
}

/**
 * The host published imagery is served from, for `next.config.js` and the CSP.
 *
 * An image from a host that is not declared there fails configuration rather
 * than rendering unoptimised, which is the behaviour we want — so this is
 * derived from the same value the fetcher uses and never written twice.
 *
 * Null only when the variable is missing or unparseable, which is the same
 * misconfiguration `contentOrigin` throws on. This one returns rather than
 * throws because it runs inside the build's config, where an exception is a
 * failed build rather than a degraded page.
 */
export function contentHost(): string | null {
  const configured = (process.env.BLOG_CONTENT_ORIGIN ?? '').trim();
  if (!configured) return null;
  try {
    return new URL(configured).hostname;
  } catch {
    return null;
  }
}
