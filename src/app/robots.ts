import type { MetadataRoute } from 'next'
import { getPublicAppOrigin } from '@/lib/app-url'

export default function robots(): MetadataRoute.Robots {
  const sitemapUrl = `${getPublicAppOrigin()}/sitemap.xml`
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/account/',
        '/discussion/new',
        '/login/',
        '/register/',
        '/forgot-password/',
      ],
    },
    sitemap: sitemapUrl,
  }
}
