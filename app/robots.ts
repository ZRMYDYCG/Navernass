import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/chat',
          '/novels',
          '/trash',
          '/writing',
          '/workspace',
          '/editor',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
