import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/work-management/',
        '/my-requests/',
        '/discussion/new',
        '/login/',
        '/register/',
        '/forgot-password/',
      ],
    },
    sitemap: 'https://www.cgrs.co.nz/sitemap.xml',
  }
}
