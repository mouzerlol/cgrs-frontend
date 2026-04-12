import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import newsData from '@/data/news.json'
import eventsData from '@/data/events.json'
import discussionsData from '@/data/discussions.json'
import { getPublicAppOrigin } from '@/lib/app-url'

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
    const entries = sitemap()
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('includes all static routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
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
    ]
    for (const route of expectedStaticRoutes) {
      expect(urls).toContain(route)
    }
  })

  it('does not include auth pages', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/login/`)
    expect(urls).not.toContain(`${BASE_URL}/register/`)
    expect(urls).not.toContain(`${BASE_URL}/forgot-password/`)
  })

  it('does not include design-system page', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/design-system/`)
  })

  it('includes all blog post routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    for (const article of newsData.articles) {
      expect(urls).toContain(`${BASE_URL}/blog/${article.slug}/`)
    }
  })

  it('includes all calendar event routes with slugs', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    for (const event of eventsWithSlugs) {
      expect(urls).toContain(`${BASE_URL}/calendar/${event.slug}/`)
    }
  })

  it('includes all discussion thread routes', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const urls = entries.map((e) => e.url)
    for (const thread of discussionsData.threads) {
      expect(urls).toContain(`${BASE_URL}/discussion/thread/${thread.id}/`)
    }
  })

  it('has required fields on every entry', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
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
    const entries = sitemap()
    const homepage = entries.find((e) => e.url === `${BASE_URL}/`)
    expect(homepage?.priority).toBe(1)
  })

  it('uses trailing slashes on all URLs', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    for (const entry of entries) {
      expect(entry.url).toMatch(/\/$/)
    }
  })

  it('has the expected total number of entries', async () => {
    const { default: sitemap } = await import('../sitemap')
    const entries = sitemap()
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    const expectedCount =
      10 + // static routes
      newsData.articles.length +
      eventsWithSlugs.length +
      discussionsData.threads.length
    expect(entries).toHaveLength(expectedCount)
  })
})