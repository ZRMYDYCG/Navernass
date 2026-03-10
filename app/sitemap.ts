import type { MetadataRoute } from 'next'
import { getAbsoluteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: getAbsoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: getAbsoluteUrl('/survey'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]
}
