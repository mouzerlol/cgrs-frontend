import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login/', '/register/', '/forgot-password/', '/design-system/'],
    },
    sitemap: 'https://coronationgardens.co.nz/sitemap.xml',
  }
}
