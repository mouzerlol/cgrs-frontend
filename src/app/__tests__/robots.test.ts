import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getPublicAppOrigin } from '@/lib/app-url'

describe('robots', () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env.NEXT_PUBLIC_APP_URL = 'https://www.cgrs.co.nz'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('returns a robots configuration object', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    expect(config).toBeDefined()
    expect(config.rules).toBeDefined()
  })

  it('allows all user agents', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    const rules = config.rules
    if (Array.isArray(rules)) {
      expect(rules.some((r) => r.userAgent === '*')).toBe(true)
    } else {
      expect(rules.userAgent).toBe('*')
    }
  })

  it('allows crawling of root path', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    const rules = config.rules
    if (Array.isArray(rules)) {
      const globalRule = rules.find((r) => r.userAgent === '*')
      expect(globalRule?.allow).toContain('/')
    } else {
      expect(rules.allow).toBe('/')
    }
  })

  it('disallows auth pages', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    const rules = config.rules
    const disallow = Array.isArray(rules) ? rules[0].disallow : rules.disallow
    expect(disallow).toContain('/login/')
    expect(disallow).toContain('/register/')
    expect(disallow).toContain('/forgot-password/')
  })

  it('references sitemap URL derived from app origin (not hardcoded)', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    expect(config.sitemap).toBe(`${getPublicAppOrigin()}/sitemap.xml`)
  })

  it('sitemap URL adapts to NEXT_PUBLIC_APP_URL env var', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://staging.cgrs.co.nz'
    const { default: robots } = await import('../robots')
    const config = robots()
    expect(config.sitemap).toBe('https://staging.cgrs.co.nz/sitemap.xml')
  })

  it('disallows profile routes', async () => {
    const { default: robots } = await import('../robots')
    const config = robots()
    const rules = config.rules
    const disallow = Array.isArray(rules) ? rules[0].disallow : rules.disallow
    expect(disallow).toContain('/profile/')
  })
})
