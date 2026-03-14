/** @type {import('next').NextConfig} */

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
    // Allow images from any HTTPS source
    // For production, consider restricting to specific domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
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
        source: '/favicon-32x32.png',
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://i.pravatar.cc https://via.placeholder.com https://placehold.co https://*.tile.openstreetmap.org https://*.openstreetmap.org https://img.clerk.com",
              `connect-src 'self' https://*.tile.openstreetmap.org https://*.clerk.accounts.dev https://clerk-telemetry.com http://localhost:8000 http://api:8000`,
              "worker-src 'self' blob:",
              "frame-src 'self' https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
