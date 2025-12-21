'use client'

import type { NewsItem } from '../types'
import { NewsCard } from './news-card'

interface NewsContentProps {
  items: NewsItem[]
}

export function NewsContent({ items }: NewsContentProps) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground text-sm">暂无动态</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {items.map(item => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}
