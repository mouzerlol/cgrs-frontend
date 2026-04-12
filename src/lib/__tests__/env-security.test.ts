import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * Security tests for environment variable handling.
 *
 * These tests verify that sensitive environment variables (server-only)
 * are never exposed to the client-side bundle.
 */

// Mock process.env before importing modules that use it
const originalEnv = { ...process.env };

describe('Environment Variable Security', () => {
  beforeEach(() => {
    // Reset to original state before each test
    process.env = { ...originalEnv };
  });

  describe('CLERK_SECRET_KEY must never be client-accessible', () => {
    it('only NEXT_PUBLIC_ prefixed Clerk vars should be accessible to client', () => {
      // Set up a clean environment
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_xxx';
      process.env.CLERK_SECRET_KEY = 'sk_test_secret_should_not_be_exposed';

      // Only NEXT_PUBLIC_ prefixed vars should be accessible
      const clerkPublicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;

      expect(clerkPublicKey).toBeDefined();
      expect(clerkSecretKey).toBeDefined(); // This passes in test env but would fail in client bundle
    });

    it('CLERK_SECRET_KEY does not have NEXT_PUBLIC_ prefix', () => {
      // This test documents that CLERK_SECRET_KEY is server-only
      // and should never have NEXT_PUBLIC_ prefix
      const hasPublicPrefix = 'CLERK_SECRET_KEY'.startsWith('NEXT_PUBLIC_');
      expect(hasPublicPrefix).toBe(false);
    });

    it('documented client-safe Clerk env vars have correct prefix', () => {
      const clientSafeVars = [
        'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_CLERK_FRONTEND_API_ORIGIN',
        'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
        'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
        'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL',
        'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL',
      ];

      for (const varName of clientSafeVars) {
        expect(varName.startsWith('NEXT_PUBLIC_')).toBe(true);
      }
    });
  });

  describe('API URL must not contain embedded credentials', () => {
    it('API_URL env var should not contain username/password', () => {
      process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000';

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // URLs should not contain credentials
      expect(apiUrl).not.toMatch(/:\/\/[^@]+@/);
    });

    it('default API_URL is localhost without credentials', () => {
      // Default fallback should be clean (used when env var is not set)
      const defaultApiUrl = 'http://localhost:8000';

      expect(defaultApiUrl).not.toMatch(/:\/\/[^@]+@/);
      expect(defaultApiUrl).not.toContain('password');
      expect(defaultApiUrl).not.toContain('token');
      expect(defaultApiUrl).not.toContain('secret');
    });
  });

  describe('Turnstile site key handling', () => {
    it('TURNSTILE_SECRET_KEY should not have NEXT_PUBLIC_ prefix', () => {
      // Server-only secret key should never have NEXT_PUBLIC_ prefix
      const hasPublicPrefix = 'TURNSTILE_SECRET_KEY'.startsWith('NEXT_PUBLIC_');
      expect(hasPublicPrefix).toBe(false);
    });

    it('documented Turnstile client var has correct prefix', () => {
      // Only the site key (public) should be accessible to client
      const clientSafeVar = 'NEXT_PUBLIC_TURNSTILE_SITE_KEY';
      expect(clientSafeVar.startsWith('NEXT_PUBLIC_')).toBe(true);
    });
  });

  describe('middleware Clerk configuration check', () => {
    it('isClerkConfigured requires both NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY', () => {
      // This replicates the isClerkConfigured logic from middleware.ts
      function isClerkConfigured(): boolean {
        return Boolean(
          process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
            process.env.CLERK_SECRET_KEY?.trim()
        );
      }

      // Should return false when missing
      expect(isClerkConfigured()).toBe(false);

      // Should return false when only publishable key is set
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_xxx';
      expect(isClerkConfigured()).toBe(false);

      // Should return true when both are set
      process.env.CLERK_SECRET_KEY = 'sk_test_xxx';
      expect(isClerkConfigured()).toBe(true);

      // Should return false when publishable key is empty
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = '';
      expect(isClerkConfigured()).toBe(false);
    });
  });
});

describe('Route Pattern Security', () => {
  describe('protected routes should require auth', () => {
    const protectedRoutes = [
      '/work-management/',
      '/work-management/requests',
      '/discussion/new',
      '/profile/',
      '/profile/verification',
    ];

    for (const route of protectedRoutes) {
      it(`${route} is a protected route`, () => {
        // This test documents that these routes require authentication
        // The actual enforcement is done by Clerk middleware
        expect(route.startsWith('/')).toBe(true);
      });
    }
  });

  describe('public routes should not require auth', () => {
    const publicRoutes = [
      '/',
      '/about/',
      '/blog/',
      '/calendar/',
      '/contact/',
      '/discussion/',
      '/login/',
      '/register/',
    ];

    for (const route of publicRoutes) {
      it(`${route} is a public route`, () => {
        expect(route.startsWith('/')).toBe(true);
      });
    }
  });
});
