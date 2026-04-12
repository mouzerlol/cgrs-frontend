/** @type {import('next').NextConfig} */

/** Optional extra origins for connect-src (e.g. production API on Cloud Run). */
function cspApiConnectOrigins() {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}

/** Production custom Clerk Frontend API (Dashboard → Domains). clerk.browser.js loads from this origin — must be in script-src. */
const CLERK_CUSTOM_FRONTEND_ORIGIN = 'https://clerk.cgrs.co.nz';

/**
 * Clerk script/connect/frame sources for CSP. Dev uses *.clerk.accounts.dev; production uses
 * *.clerk.com, optional custom Frontend API host, and CLERK_CUSTOM_FRONTEND_ORIGIN so builds
 * still allow clerk-js if NEXT_PUBLIC_CLERK_FRONTEND_API_ORIGIN was missing at build time.
 */
function cspClerkOrigins() {
  const parts = [
    'https://*.clerk.accounts.dev',
    'https://*.clerk.com',
    'https://clerk-telemetry.com',
    CLERK_CUSTOM_FRONTEND_ORIGIN,
  ];
  const custom = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API_ORIGIN?.trim();
  if (custom) {
    try {
      const origin = new URL(custom).origin;
      if (!parts.includes(origin)) {
        parts.push(origin);
      }
    } catch {
      // ignore invalid URL
    }
  }
  return parts.join(' ');
}

const nextConfig = {
  // Rendering Strategy:
  // - Static export is disabled to enable SSR and ISR features
  // - Pages use mixed rendering: SSG (blog/calendar) and SSR (homepage)
  // - This allows dynamic content while maintaining performance
  // output: 'export', // Disabled - using SSR/ISR instead of static export

  // Trailing slashes for consistent URLs
  trailingSlash: true,

  // Image optimization configuration
  images: {
    // Restrict image sources to specific trusted domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'clerk.cgrs.co.nz',
      },
      {
        protocol: 'https',
        hostname: '*.tile.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: '*.openstreetmap.org',
      },
      {
        protocol: 'https',
        hostname: 'basemaps.linz.govt.nz',
      },
      {
        protocol: 'https',
        hostname: '*.data-cdn.linz.govt.nz',
      },
      {
        protocol: 'https',
        hostname: 'tiles.stadiamaps.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
    // Production optimizations (defaults are good, but documented here)
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false, // Remove X-Powered-By header for security
  productionBrowserSourceMaps: false, // Prevent source map leaks in production

  // Security headers for all routes
  async headers() {
    return [
      // Long-lived cache for favicon so the browser doesn't refetch on every page load
      {
        source: '/favicon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${cspClerkOrigins()} https://*.cloudflare.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://i.pravatar.cc https://via.placeholder.com https://placehold.co https://*.tile.openstreetmap.org https://*.openstreetmap.org https://basemaps.linz.govt.nz https://*.data-cdn.linz.govt.nz https://tiles.stadiamaps.com https://img.clerk.com https://*.r2.cloudflarestorage.com",
              `connect-src 'self' https://*.r2.cloudflarestorage.com https://*.tile.openstreetmap.org https://basemaps.linz.govt.nz https://*.data-cdn.linz.govt.nz https://tiles.stadiamaps.com ${cspClerkOrigins()} https://*.cloudflare.com https://*.a.run.app https://*.australia-southeast1.run.app ${cspApiConnectOrigins()} http://127.0.0.1:7705 http://localhost:8000 http://api:8000`.replace(/\s+/g, ' ').trim(),
              "worker-src 'self' blob:",
              `frame-src 'self' ${cspClerkOrigins()} https://challenges.cloudflare.com`,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
