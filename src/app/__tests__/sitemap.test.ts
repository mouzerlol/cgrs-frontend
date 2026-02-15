import { describe, it, expect } from 'vitest'
import sitemap from '../sitemap'
import newsData from '@/data/news.json'
import eventsData from '@/data/events.json'
import discussionsData from '@/data/discussions.json'

const BASE_URL = 'https://coronationgardens.co.nz'

describe('sitemap', () => {
  const entries = sitemap()

  it('returns an array of sitemap entries', () => {
    expect(Array.isArray(entries)).toBe(true)
    expect(entries.length).toBeGreaterThan(0)
  })

  it('includes all static routes', () => {
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

  it('does not include auth pages', () => {
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/login/`)
    expect(urls).not.toContain(`${BASE_URL}/register/`)
    expect(urls).not.toContain(`${BASE_URL}/forgot-password/`)
  })

  it('does not include design-system page', () => {
    const urls = entries.map((e) => e.url)
    expect(urls).not.toContain(`${BASE_URL}/design-system/`)
  })

  it('includes all blog post routes', () => {
    const urls = entries.map((e) => e.url)
    for (const article of newsData.articles) {
      expect(urls).toContain(`${BASE_URL}/blog/${article.slug}/`)
    }
  })

  it('includes all calendar event routes with slugs', () => {
    const urls = entries.map((e) => e.url)
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    for (const event of eventsWithSlugs) {
      expect(urls).toContain(`${BASE_URL}/calendar/${event.slug}/`)
    }
  })

  it('includes all discussion thread routes', () => {
    const urls = entries.map((e) => e.url)
    for (const thread of discussionsData.threads) {
      expect(urls).toContain(`${BASE_URL}/discussion/thread/${thread.id}/`)
    }
  })

  it('has required fields on every entry', () => {
    for (const entry of entries) {
      expect(entry.url).toBeDefined()
      expect(entry.url).toMatch(/^https:\/\/coronationgardens\.co\.nz\//)
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

  it('gives homepage highest priority', () => {
    const homepage = entries.find((e) => e.url === `${BASE_URL}/`)
    expect(homepage?.priority).toBe(1)
  })

  it('uses trailing slashes on all URLs', () => {
    for (const entry of entries) {
      expect(entry.url).toMatch(/\/$/)
    }
  })

  it('has the expected total number of entries', () => {
    const eventsWithSlugs = eventsData.events.filter((e) => e.slug)
    const expectedCount =
      10 + // static routes
      newsData.articles.length +
      eventsWithSlugs.length +
      discussionsData.threads.length
    expect(entries).toHaveLength(expectedCount)
  })
})
