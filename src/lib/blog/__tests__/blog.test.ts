import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Manifest } from '../types';

/**
 * The reading path's behaviour.
 *
 * Every case drives the module the way production does — a configured origin and
 * an HTTP fetch — with the fetch mocked, rather than through a bundled fixture
 * origin. That mode is gone: it put invented posts inside the production bundle
 * and made "no origin configured" look like a working site instead of a broken
 * one. Stubbing the response here covers the same states, including both
 * degraded ones, and covers them at the boundary the deployed application
 * actually uses.
 */

const ORIGIN = 'BLOG_CONTENT_ORIGIN';
const BASE = 'https://content.example.test';

function post(overrides: Partial<Manifest['posts'][number]> = {}): Manifest['posts'][number] {
  return {
    slug: 'a-post',
    title: 'A post',
    excerpt: 'An excerpt.',
    date: '2026-08-01',
    updated: null,
    author: 'The Committee',
    categorySlug: 'updates',
    categoryLabel: 'Updates',
    featured: false,
    readingTime: 3,
    bodyKey: 'posts/a-post-0000000000000000.json',
    hero: null,
    ...overrides,
  };
}

/** Newest first with two categories, which is the shape the writer emits. */
const MANIFEST: Manifest = {
  schemaVersion: 1,
  generatedAt: '2026-08-07T04:12:09Z',
  posts: [
    post({ slug: 'newest', title: 'Newest', bodyKey: 'posts/newest-aaaa.json', featured: true }),
    post({ slug: 'middle', title: 'Middle', bodyKey: 'posts/middle-bbbb.json' }),
    post({
      slug: 'oldest',
      title: 'Oldest',
      bodyKey: 'posts/oldest-cccc.json',
      categorySlug: 'events',
      categoryLabel: 'Events',
    }),
  ],
  categories: [
    { slug: 'updates', label: 'Updates', count: 2 },
    { slug: 'events', label: 'Events', count: 1 },
  ],
};

const EMPTY_MANIFEST: Manifest = {
  schemaVersion: 1,
  generatedAt: '2026-08-07T04:12:09Z',
  posts: [],
  categories: [],
};

const BODY = {
  schemaVersion: 1,
  slug: 'newest',
  blocks: [{ type: 'paragraph', runs: [{ text: 'The body.' }] }],
};

async function loadModule() {
  vi.resetModules();
  return import('../index');
}

/** Serve the manifest at `index.json` and a body at any `posts/` key. */
function serve(manifest: unknown = MANIFEST) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    const payload = url.endsWith('index.json') ? manifest : BODY;
    return { ok: true, status: 200, json: async () => payload } as Response;
  });
}

let originalOrigin: string | undefined;

beforeEach(() => {
  originalOrigin = process.env[ORIGIN];
  process.env[ORIGIN] = BASE;
});

afterEach(() => {
  if (originalOrigin === undefined) delete process.env[ORIGIN];
  else process.env[ORIGIN] = originalOrigin;
  vi.restoreAllMocks();
});

describe('the content origin', () => {
  it('serves every published post', async () => {
    serve();
    const { listPosts } = await loadModule();

    expect(await listPosts()).toHaveLength(MANIFEST.posts.length);
  });

  it('reads the manifest from the configured origin, trailing slash or not', async () => {
    process.env[ORIGIN] = `${BASE}/`;
    const fetchSpy = serve();
    const { listPosts } = await loadModule();

    await listPosts();

    expect(fetchSpy).toHaveBeenCalledWith(`${BASE}/index.json`, expect.anything());
  });

  it('carries no body content in a listing payload', async () => {
    serve();
    const { listPosts } = await loadModule();

    for (const found of await listPosts()) {
      expect(found).not.toHaveProperty('blocks');
      expect(found).not.toHaveProperty('content');
      expect(found.bodyKey).toMatch(/^posts\//);
    }
  });

  it('fetches a body only when an article is rendered', async () => {
    const fetchSpy = serve();
    const { listPosts, getPostWithBody } = await loadModule();

    // A listing reads the manifest and stops there: bodies are the expensive
    // half of the origin and no grid of cards needs one.
    await listPosts();
    expect(fetchSpy.mock.calls.map(([url]) => String(url))).toEqual([`${BASE}/index.json`]);

    const found = await getPostWithBody('newest');

    expect(found!.blocks.length).toBeGreaterThan(0);
    expect(fetchSpy.mock.calls.filter(([url]) => String(url).includes('/posts/'))).toHaveLength(1);
    expect(fetchSpy).toHaveBeenLastCalledWith(
      `${BASE}/posts/newest-aaaa.json`,
      expect.anything()
    );
  });

  it('returns null for a slug the manifest does not carry', async () => {
    serve();
    const { getPostWithBody } = await loadModule();

    expect(await getPostWithBody('never-published')).toBeNull();
  });

  it('never relates a post to itself, and offers at most three', async () => {
    serve();
    const { getRelatedPosts } = await loadModule();

    const related = await getRelatedPosts('newest');

    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.map((found) => found.slug)).not.toContain('newest');
  });

  it('serves categories in the order the manifest supplies them', async () => {
    serve();
    const { listCategories } = await loadModule();

    const categories = await listCategories();

    expect(categories.map((category) => category.slug)).toEqual(['updates', 'events']);
  });
});

describe('an empty manifest', () => {
  it('drives the listing empty state', async () => {
    serve(EMPTY_MANIFEST);
    const { listPosts } = await loadModule();

    expect(await listPosts()).toHaveLength(0);
  });

  it('renders no category chips, because there is nothing to filter to', async () => {
    serve(EMPTY_MANIFEST);
    const { listCategories } = await loadModule();

    expect(await listCategories()).toHaveLength(0);
  });

  it('suppresses the homepage featured section', async () => {
    serve(EMPTY_MANIFEST);
    const { getFeaturedPosts } = await loadModule();

    expect(await getFeaturedPosts()).toHaveLength(0);
  });
});

describe('degradation', () => {
  it('keeps serving the last good manifest when a refetch fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    serve();
    const blog = await loadModule();
    const first = await blog.listPosts();

    vi.restoreAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('origin unreachable'));

    const second = await blog.listPosts();

    // The visitor sees content. A blip on a public page is not an outage.
    expect(second).toHaveLength(first.length);
  });

  it('logs the failure rather than swallowing it', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    serve();
    const blog = await loadModule();
    await blog.listPosts();

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('origin unreachable'));
    await blog.listPosts();

    expect(error).toHaveBeenCalled();
  });

  it('surfaces the unavailable state only when nothing has ever been cached', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const blog = await loadModule();
    blog.__resetManifestCache();
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('origin unreachable'));

    await expect(blog.getManifest()).rejects.toThrow('Blog content is unavailable.');
    expect(await blog.getManifestOrNull()).toBeNull();
  });

  it('treats a non-2xx response as a failure, not as an empty manifest', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const blog = await loadModule();
    blog.__resetManifestCache();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({}),
    } as Response);

    expect(await blog.getManifestOrNull()).toBeNull();
  });

  it('degrades rather than throwing when no origin is configured at all', async () => {
    /*
     * The whole reason the fixture origin was removed. A deployment that loses
     * `BLOG_CONTENT_ORIGIN` used to fall back to four invented posts and look
     * entirely healthy; it now reaches the same visible unavailable state an
     * unreachable bucket produces, and touches the network for nothing.
     */
    vi.spyOn(console, 'error').mockImplementation(() => {});
    delete process.env[ORIGIN];
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const blog = await loadModule();
    blog.__resetManifestCache();

    expect(await blog.getManifestOrNull()).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

/**
 * The visibility gate.
 *
 * Note the fetch stub below matches `members-index.json` *before* `index.json`:
 * the public key is a suffix of the gated one, so a naive `endsWith` check hands
 * the public manifest back for both and every case here passes vacuously.
 */
const GATED_MANIFEST: Manifest = {
  schemaVersion: 2,
  generatedAt: '2026-08-07T04:12:09Z',
  posts: [
    post({
      slug: 'levy-detail',
      title: 'Levy detail',
      date: '2026-08-05',
      bodyKey: 'posts/levy-detail-dddd.json',
      categorySlug: 'governance',
      categoryLabel: 'Governance',
      visibility: 'owners',
    }),
  ],
  categories: [{ slug: 'governance', label: 'Governance', count: 1 }],
};

function serveBoth(gated: unknown = GATED_MANIFEST, publicManifest: unknown = MANIFEST) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
    const url = String(input);
    if (url.endsWith('members-index.json')) {
      if (gated === null) return { ok: false, status: 404, json: async () => ({}) } as Response;
      return { ok: true, status: 200, json: async () => gated } as Response;
    }
    const payload = url.endsWith('index.json') ? publicManifest : BODY;
    return { ok: true, status: 200, json: async () => payload } as Response;
  });
}

describe('the visibility gate', () => {
  it('hides gated posts from a viewer who does not pass', async () => {
    serveBoth();
    const { getManifestForViewer } = await loadModule();

    const manifest = await getManifestForViewer(false);

    expect(manifest?.posts.map((found) => found.slug)).not.toContain('levy-detail');
    expect(manifest?.posts).toHaveLength(MANIFEST.posts.length);
  });

  it('shows them to a viewer who does', async () => {
    serveBoth();
    const { getManifestForViewer } = await loadModule();

    const manifest = await getManifestForViewer(true);

    expect(manifest?.posts.map((found) => found.slug)).toContain('levy-detail');
  });

  it('does not fetch the members manifest for a viewer who does not pass', async () => {
    const fetchSpy = serveBoth();
    const { getManifestForViewer } = await loadModule();

    await getManifestForViewer(false);

    const asked = fetchSpy.mock.calls.map(([input]) => String(input));
    expect(asked.some((url) => url.endsWith('members-index.json'))).toBe(false);
  });

  it('merges the two lists back into one date order', async () => {
    serveBoth();
    const { getManifestForViewer } = await loadModule();

    const manifest = await getManifestForViewer(true);
    const dates = (manifest?.posts ?? []).map((found) => found.date);

    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('counts a merged category once, not once per manifest', async () => {
    serveBoth();
    const { getManifestForViewer } = await loadModule();

    const manifest = await getManifestForViewer(true);
    const slugs = (manifest?.categories ?? []).map((category) => category.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('404s a gated slug for a viewer who does not pass, the same as an unknown one', async () => {
    serveBoth();
    const { getPostWithBody } = await loadModule();

    expect(await getPostWithBody('levy-detail', false)).toBeNull();
    expect(await getPostWithBody('never-existed', false)).toBeNull();
  });

  it('serves the same slug to a viewer who does', async () => {
    serveBoth();
    const { getPostWithBody } = await loadModule();

    expect(await getPostWithBody('levy-detail', true)).not.toBeNull();
  });

  it('defaults to the public surface when a caller does not mention the gate', async () => {
    serveBoth();
    const { getPost } = await loadModule();

    expect(await getPost('levy-detail')).toBeNull();
  });

  it('treats a missing members manifest as no gated posts rather than an outage', async () => {
    serveBoth(null);
    const { getManifestForViewer } = await loadModule();

    const manifest = await getManifestForViewer(true);

    expect(manifest?.posts).toHaveLength(MANIFEST.posts.length);
  });

  it('keeps gated posts out of related posts for a viewer who does not pass', async () => {
    serveBoth();
    const { getRelatedPosts } = await loadModule();

    const related = await getRelatedPosts('newest', 3, false);

    expect(related.map((found) => found.slug)).not.toContain('levy-detail');
  });

  it('reports a gated slug as gated, so the share card can refuse it', async () => {
    serveBoth();
    const { isGatedSlug } = await loadModule();

    expect(await isGatedSlug('levy-detail')).toBe(true);
    expect(await isGatedSlug('newest')).toBe(false);
  });
});
