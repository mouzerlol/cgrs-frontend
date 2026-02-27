/** @type {import('next').NextConfig} */
const debugConnectSrc = process.env.NODE_ENV !== 'production' ? ' http://127.0.0.1:7719' : '';

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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
              "font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com",
              "img-src 'self' data: blob: https://i.pravatar.cc https://via.placeholder.com https://*.tile.openstreetmap.org https://*.openstreetmap.org",
              `connect-src 'self' https://*.tile.openstreetmap.org${debugConnectSrc}`,
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
