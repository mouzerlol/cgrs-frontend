import type { MetadataRoute } from 'next'
import eventsData from '@/data/events.json'
import discussionsData from '@/data/discussions.json'
import { getPublicAppOrigin } from '@/lib/app-url'
import { MANIFEST_REVALIDATE_SECONDS, getManifestOrNull } from '@/lib/blog'

/** Fails the build if the literal below drifts from the manifest's own window. */
const _revalidateMatchesManifest: 60 = MANIFEST_REVALIDATE_SECONDS

/**
 * Generated at request time, not at build.
 *
 * Blog entries come from the published manifest, and publishing deliberately
 * requires no deployment — so a sitemap fixed at build would freeze at whatever
 * was live when the last release shipped. It would look entirely correct in
 * review and be wrong in production, which is the worst combination available.
 *
 * The window matches the manifest's own, so the sitemap is never fresher or
 * staler than the pages it lists.
 *
 * Written as a literal because Next.js reads this field statically at build and
 * refuses an identifier: `Unknown identifier "MANIFEST_REVALIDATE_SECONDS" at
 * "revalidate"`. Keep it equal to `MANIFEST_REVALIDATE_SECONDS` in
 * `lib/blog/origin.ts`, which the assertion below holds to.
 */
export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE_URL = getPublicAppOrigin()
  // Static routes with their change frequencies and priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about/`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/calendar/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact/`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/discussion/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guidelines/`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/map/`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/notice-board/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/management-request/`,
      lastModified: new Date('2024-01-15'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/sustainability/`,
      lastModified: new Date('2026-05-13'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]

  // Dynamic blog post routes, from the manifest. An unreachable content origin
  // costs the blog entries and leaves every other route in place — a sitemap
  // missing a section beats a sitemap that fails to render.
  const manifest = await getManifestOrNull()
  const blogRoutes: MetadataRoute.Sitemap = (manifest?.posts ?? []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}/`,
    // The updated date where the post carries one, its publication date where
    // it does not — last-modified means the last time the content changed.
    lastModified: new Date(post.updated ?? post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Dynamic calendar event routes
  const calendarRoutes: MetadataRoute.Sitemap = eventsData.events
    .filter((event) => event.slug)
    .map((event) => ({
      url: `${BASE_URL}/calendar/${event.slug}/`,
      lastModified: new Date(event.date),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  // Dynamic discussion thread routes
  const discussionRoutes: MetadataRoute.Sitemap = discussionsData.threads.map(
    (thread) => ({
      url: `${BASE_URL}/discussion/thread/${thread.id}/`,
      lastModified: new Date(thread.createdAt),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })
  )

  return [...staticRoutes, ...blogRoutes, ...calendarRoutes, ...discussionRoutes]
}
