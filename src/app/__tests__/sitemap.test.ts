import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import eventsData from '@/data/events.json'
import discussionsData from '@/data/discussions.json'
import { getPublicAppOrigin } from '@/lib/app-url'

/**
 * The sitemap is generated at request time from the published manifest, not at
 * build from a bundled file.
 *
 * The manifest is stubbed at the access module rather than served from a
 * checked-in fixture origin, which no longer exists. What these assert is the
 * sitemap's own behaviour — that it reads whatever the manifest says now — and
 * a stub states that more directly than a generated file did: the posts below
 * are deliberately not any real post, so a sitemap built from a bundled
 * snapshot could not accidentally pass.
 */

const BLOG_POSTS = [
  { slug: 'first-post', date: '2026-07-02', updated: null },
  { slug: 'second-post', date: '2026-07-14', updated: '2026-08-01' },
]

vi.mock('@/lib/blog', async () => {
  const origin = await import('@/lib/blog/origin')
  return {
    MANIFEST_REVALIDATE_SECONDS: origin.MANIFEST_REVALIDATE_SECONDS,
    getManifestOrNull: async () => ({
      schemaVersion: 1,
      generatedAt: '2026-08-07T04:12:09Z',
      posts: BLOG_POSTS,
      categories: [],
    }),
  }
})

describe('sitemap', () => {
  let originalEnv: NodeJS.ProcessEnv
  let BASE_URL: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.cgrs.co.nz'
    BASE_URL = getPublicAppOrigin()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns an array of sitemap entries', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('includes all static routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    const expectedStaticRoutes = [
      `${BASE_URL}/`,
      `${BASE_URL}/about/`,
      `${BASE_URL}/blog/`,
      `${BASE_URL}/calendar/`,
      `${BASE_URL}/contact/`,
      `${BASE_URL}/discussion/`,
      `${BASE_URL}/guidelines/`,
      `${BASE_URL}/map/`,
      `${BASE_URL}/notice-board/`,
      `${BASE_URL}/management-request/`,
      `${BASE_URL}/sustainability/`,
    ]
    for (const route of expectedStaticRoutes) {
      expect(urls).toContain(route)
    }
  })

  it('does not include auth pages', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/login/`)
    expect(urls).not.toContain(`${BASE_URL}/register/`)
    expect(urls).not.toContain(`${BASE_URL}/forgot-password/`)
  })

  it('does not include design-system page', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/design-system/`)
  })

  it('includes all blog post routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    for (const post of BLOG_POSTS) {
      expect(urls).toContain(`${BASE_URL}/blog/${post.slug}/`)
    }
  })

  it('includes all calendar event routes with slugs', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    for (const event of eventsWithSlugs) {
      expect(urls).toContain(`${BASE_URL}/calendar/${event.slug}/`)
    }
  })

  it('includes all discussion thread routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const urls = entries.map((e) => e.url)
    for (const thread of discussionsData.threads) {
      expect(urls).toContain(`${BASE_URL}/discussion/thread/${thread.id}/`)
    }
  })

  it('has required fields on every entry', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    for (const entry of entries) {
      expect(entry.url).toBeDefined()
      expect(entry.url).toMatch(/^https:\/\//)
      expect(entry.lastModified).toBeInstanceOf(Date)
      expect(entry.changeFrequency).toBeDefined()
      expect(
        ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'].includes(
          entry.changeFrequency as string
        )
      ).toBe(true)
      expect(entry.priority).toBeDefined()
      expect(entry.priority).toBeGreaterThanOrEqual(0)
      expect(entry.priority).toBeLessThanOrEqual(1)
    }
  })

  it('gives homepage highest priority', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const homepage = entries.find((e) => e.url === `${BASE_URL}/`)
    expect(homepage?.priority).toBe(1)
  })

  it('derives blog entries from the current manifest, not a build-time snapshot', async () => {
    // A post published after the last deployment has to appear. The manifest is
    // read on every generation, so the only thing that decides is what it says
    // now — which is exactly what this asserts by reading the same source.
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const blogEntries = entries.filter((e) => /\/blog\/[^/]+\/$/.test(e.url))
    expect(blogEntries).toHaveLength(BLOG_POSTS.length)
  })

  it('uses the updated date as last-modified where a post carries one', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const updated = BLOG_POSTS.find((post) => post.updated)
    expect(updated).toBeDefined()
    const entry = entries.find((e) => e.url === `${BASE_URL}/blog/${updated!.slug}/`)
    expect((entry!.lastModified as Date).toISOString().slice(0, 10)).toBe(updated!.updated)
  })

  it('uses trailing slashes on all URLs', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    for (const entry of entries) {
      expect(entry.url).toMatch(/\/$/)
    }
  })

  it('has the expected total number of entries', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = await sitemap()
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    const expectedCount =
      11 + // static routes
      BLOG_POSTS.length +
      eventsWithSlugs.length +
      discussionsData.threads.length
    expect(entries).toHaveLength(expectedCount)
  })
})
describe('the sitemap and the visibility gate', () => {
  /*
   * Asserted over the source rather than by stubbing a gated post, because the
   * exclusion is structural: the sitemap reads the public manifest, and a post
   * gated to owners was never written into it. There is nothing to filter, and
   * that is the property worth protecting — a future edit that reached for the
   * merged manifest "so members get a complete sitemap" would put gated URLs
   * into the file crawlers fetch.
   */
  it('reads the public manifest only, so gated posts cannot reach it', async () => {
    const { readFileSync } = await import('node:fs')
    const { join, resolve } = await import('node:path')
    const source = readFileSync(
      join(resolve(__dirname, '../../..'), 'src/app/sitemap.ts'),
      'utf8',
    )

    expect(source).toContain('getManifestOrNull')
    expect(source).not.toMatch(/getManifestForViewer|canViewGatedPosts|members-index/)
  })
})
