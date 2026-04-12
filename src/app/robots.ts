import type { MetadataRoute } from 'next'
import { getPublicAppOrigin } from '@/lib/app-url'

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = `${getPublicAppOrigin()}/sitemap.xml`
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/work-management/',
        '/profile/',
        '/discussion/new',
        '/login/',
        '/register/',
        '/forgot-password/',
      ],
    },
    sitemap: sitemapUrl,
  }
}
