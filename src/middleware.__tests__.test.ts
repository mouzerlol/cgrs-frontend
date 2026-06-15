import { describe, it, expect } from 'vitest'

/**
 * Route patterns that should require authentication.
 * This mirrors the patterns in middleware.ts isProtectedRoute.
 * Tests verify that account routes are included in protection.
 */
const PROTECTED_ROUTE_PATTERNS = [
  '/admin(.*)',
  '/discussion/new(.*)',
  '/account(.*)',
] as const

/**
 * Converts Clerk glob patterns to regex for testing.
 * - (.*) means "zero or more of any character" (any suffix)
 * - * means "zero or more chars except /"
 * - . is literal dot (only outside of (.*) parens)
 */
function matchesGlob(pathname: string, pattern: string): boolean {
  // Replace (.*) with a placeholder that won't be affected by dot escaping
  const SUFFIX_PATTERN = '⟨SUFFIX⟩'
  let regexPattern = pattern.replace(/\(\.\*\)/g, SUFFIX_PATTERN)

  // Now escape literal dots
  regexPattern = regexPattern.replace(/\./g, '\\.')

  // Handle ** and * globs
  regexPattern = regexPattern.replace(/\*\*/g, '⟨DOUBLE⟩')
  regexPattern = regexPattern.replace(/\*/g, '[^/]*')
  regexPattern = regexPattern.replace(/⟨DOUBLE⟩/g, '.*')

  // Restore the suffix pattern as "optional any characters"
  regexPattern = regexPattern.replace(RegExp(SUFFIX_PATTERN, 'g'), '(?:.*)?')

  return new RegExp(`^${regexPattern}$`).test(pathname)
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => matchesGlob(pathname, pattern))
}

describe('middleware route protection', () => {
  describe('account routes should be protected', () => {
    const accountPaths = [
      '/account/',
      '/account/verification',
      '/account/reported-issues',
      '/account/reported-issues/28b81a2e-1d4d-4109-981d-d5ee4bba704d',
      '/account/my-property',
    ]

    for (const path of accountPaths) {
      it(`protects ${path}`, () => {
        expect(isProtectedPath(path)).toBe(true)
      })
    }
  })

  describe('existing protected routes still protected', () => {
    const workManagementPaths = [
      '/admin/',
      '/admin/requests',
    ]

    for (const path of workManagementPaths) {
      it(`still protects ${path}`, () => {
        expect(isProtectedPath(path)).toBe(true)
      })
    }

    const discussionNewPaths = ['/discussion/new', '/discussion/new/']

    for (const path of discussionNewPaths) {
      it(`still protects ${path}`, () => {
        expect(isProtectedPath(path)).toBe(true)
      })
    }
  })

  describe('public routes should not be protected', () => {
    const publicPaths = [
      '/',
      '/about/',
      '/blog/',
      '/calendar/',
      '/contact/',
      '/discussion/',
      '/discussion/thread/123',
      '/login/',
      '/register/',
      '/robots.txt',
      '/sitemap.xml',
    ]

    for (const path of publicPaths) {
      it(`does not protect ${path}`, () => {
        expect(isProtectedPath(path)).toBe(false)
      })
    }
  })
})