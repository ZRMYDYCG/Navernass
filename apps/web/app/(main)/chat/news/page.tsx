'use client'

import type { NewsItem } from './types'
import { useI18n } from '@/hooks/use-i18n'
import { NewsContent } from './_components/news-content'
import { NewsHeader } from './_components/news-header'

export default function NewsPage() {
  const { t } = useI18n()
  const rawItems = t('chat.news.items', { returnObjects: true }) as unknown
  const items: NewsItem[] = Array.isArray(rawItems) ? rawItems as NewsItem[] : []

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 页面头部 */}
      <NewsHeader />

      {/* 动态内容列表 */}
      <NewsContent items={items} />
    </div>
  )
}
