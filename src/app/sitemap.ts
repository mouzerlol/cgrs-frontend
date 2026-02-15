import type { MetadataRoute } from 'next'
import newsData from '@/data/news.json'
import eventsData from '@/data/events.json'
import discussionsData from '@/data/discussions.json'

const BASE_URL = 'https://coronationgardens.co.nz'

export default function sitemap(): MetadataRoute.Sitemap {
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
  ]

  // Dynamic blog post routes
  const blogRoutes: MetadataRoute.Sitemap = newsData.articles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}/`,
    lastModified: new Date(article.date),
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
