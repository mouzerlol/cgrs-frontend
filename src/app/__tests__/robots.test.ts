import { describe, it, expect } from 'vitest'
import robots from '../robots'

describe('robots', () => {
  const config = robots()

  it('returns a robots configuration object', () => {
    expect(config).toBeDefined()
    expect(config.rules).toBeDefined()
  })

  it('allows all user agents', () => {
    const rules = config.rules
    if (Array.isArray(rules)) {
      expect(rules.some((r) => r.userAgent === '*')).toBe(true)
    } else {
      expect(rules.userAgent).toBe('*')
    }
  })

  it('allows crawling of root path', () => {
    const rules = config.rules
    if (Array.isArray(rules)) {
      const globalRule = rules.find((r) => r.userAgent === '*')
      expect(globalRule?.allow).toContain('/')
    } else {
      expect(rules.allow).toBe('/')
    }
  })

  it('disallows auth pages', () => {
    const rules = config.rules
    const disallow = Array.isArray(rules) ? rules[0].disallow : rules.disallow
    expect(disallow).toContain('/login/')
    expect(disallow).toContain('/register/')
    expect(disallow).toContain('/forgot-password/')
  })

  it('disallows design-system page', () => {
    const rules = config.rules
    const disallow = Array.isArray(rules) ? rules[0].disallow : rules.disallow
    expect(disallow).toContain('/design-system/')
  })

  it('references the sitemap URL', () => {
    expect(config.sitemap).toBe('https://coronationgardens.co.nz/sitemap.xml')
  })
})
