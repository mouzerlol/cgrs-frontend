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
}

module.exports = nextConfig
