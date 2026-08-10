import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * The reading path touches nothing but the content origin.
 *
 * This is the change's central promise — no public page render calls the API and
 * none causes a database query — and it is the kind of promise that decays
 * quietly. One `import { getSomething } from '@/lib/api/…'` added to a blog
 * component during an unrelated change would put Cloud Run and Neon back on a
 * page anyone can hit, and nothing would look wrong in review.
 *
 * So it is asserted structurally, over the source, rather than trusted.
 */

const ROOT = resolve(__dirname, '../../../..');
const SRC = join(ROOT, 'src');

/** The public blog surfaces, and everything they are allowed to reach. */
const PUBLIC_BLOG_SOURCES = [
  'src/app/(main)/blog',
  'src/components/blog',
  'src/lib/blog',
  'src/app/api/og/blog',
];

function filesUnder(directory: string): string[] {
  const absolute = join(ROOT, directory);
  const found: string[] = [];

  const walk = (path: string) => {
    for (const entry of readdirSync(path)) {
      const child = join(path, entry);
      if (statSync(child).isDirectory()) {
        // Tests are not shipped, so they are not a render path. `admin/` is the
        // authoring side — it lives beside the blog components because it reuses
        // the renderer, and it is *supposed* to call the API.
        if (entry === '__tests__' || entry === 'admin') continue;
        walk(child);
        continue;
      }
      if (/\.tsx?$/.test(entry) && !entry.includes('.test.')) found.push(child);
    }
  };

  walk(absolute);
  return found;
}

const sources = PUBLIC_BLOG_SOURCES.flatMap(filesUnder);

describe('the public reading path', () => {
  it('has sources to check, so a passing run means something', () => {
    expect(sources.length).toBeGreaterThan(5);
  });

  it('imports nothing from the API client layer', () => {
    const offenders = sources.filter((file) =>
      /from ['"]@\/lib\/api\//.test(readFileSync(file, 'utf8'))
    );

    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('calls no data-fetching hook', () => {
    // React Query on a public blog surface would mean a browser request to the
    // API, which is exactly what the split paths exist to prevent.
    const offenders = sources.filter((file) =>
      /useQuery|useMutation|from ['"]@tanstack\/react-query['"]/.test(readFileSync(file, 'utf8'))
    );

    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('reaches the content origin only through the blog access module', () => {
    // Everything outside `src/lib/blog/` must go through the module, so the
    // origin, its caching, and its degradation live in exactly one place.
    const offenders = sources
      .filter((file) => !file.includes(join('src', 'lib', 'blog')))
      .filter((file) => /BLOG_CONTENT_ORIGIN|content\.cgrs\.co\.nz/.test(readFileSync(file, 'utf8')));

    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('keeps the article page a server component', () => {
    const article = readFileSync(join(ROOT, 'src/app/(main)/blog/[slug]/page.tsx'), 'utf8');
    const listing = readFileSync(join(ROOT, 'src/app/(main)/blog/page.tsx'), 'utf8');

    expect(article).not.toContain("'use client'");
    expect(listing).not.toContain("'use client'");
  });

  it('bundles no blog content of its own', () => {
    /*
     * There was a checked-in fixture origin here — a manifest and four body
     * artifacts, statically imported by `src/lib/blog/index.ts` and served
     * whenever `BLOG_CONTENT_ORIGIN` was unset. It shipped invented posts inside
     * the production bundle, and it meant a deployment that lost the variable
     * rendered them as real articles instead of failing visibly.
     *
     * Published content comes from the origin, over the network, always. A
     * `.json` import anywhere on the reading path is the shape that regression
     * would take, so it is asserted rather than remembered.
     */
    const offenders = sources.filter((file) =>
      /import\s[^;]*?\sfrom\s['"][^'"]+\.json['"]/.test(readFileSync(file, 'utf8'))
    );

    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  /*
   * The promise narrowed when the visibility gate landed, and narrowing it
   * quietly would be the worst outcome — a guard that still passes while
   * guarding less.
   *
   * What holds unchanged: a signed-out visitor's render calls nothing. The
   * static `/blog` routes below are what they reach, and they must stay free of
   * `auth()` and of the role lookup — reading a session inside them would opt the
   * whole segment out of static generation for crawlers too.
   *
   * What is new: `viewer.ts` may call the API, and only it. It is reached from
   * the `/blog-members` routes, which exist precisely so that this cost falls on
   * signed-in members and nobody else.
   */
  it('keeps the static blog routes free of the session and the role lookup', () => {
    const staticRoutes = [
      'src/app/(main)/blog/page.tsx',
      'src/app/(main)/blog/[slug]/page.tsx',
    ];

    for (const route of staticRoutes) {
      const source = readFileSync(join(ROOT, route), 'utf8');
      expect(source, `${route} must not read the session`).not.toMatch(
        /@clerk\/nextjs|canViewGatedPosts|blog\/viewer/
      );
      expect(source, `${route} must not opt out of static rendering`).not.toMatch(
        /force-dynamic/
      );
    }
  });

  it('makes exactly one module on the reading path talk to the API', () => {
    const offenders = sources
      .filter((file) => !file.endsWith(join('lib', 'blog', 'viewer.ts')))
      .filter((file) => /NEXT_PUBLIC_API_URL|\/api\/v1\//.test(readFileSync(file, 'utf8')));

    expect(offenders.map((file) => relative(ROOT, file))).toEqual([]);
  });

  it('keeps the block renderer free of the client boundary', () => {
    // The renderer has two callers: the server article page and the client
    // preview pane. A `use client` here would force the first off the server.
    const renderer = filesUnder('src/components/blog/blocks');

    for (const file of renderer) {
      expect(readFileSync(file, 'utf8')).not.toContain("'use client'");
    }
  });
});
