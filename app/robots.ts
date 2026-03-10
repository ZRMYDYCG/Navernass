import type { MetadataRoute } from 'next'
import { getAbsoluteUrl, getSiteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/chat',
          '/editor',
          '/novels',
          '/trash',
          '/workspace',
          '/writing',
        ],
      },
    ],
    host: getSiteUrl().origin,
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  }
}
