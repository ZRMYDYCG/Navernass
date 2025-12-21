'use client'

import { NewsContent } from './_components/news-content'
import { NewsHeader } from './_components/news-header'
import { mockNewsItems } from './config'

export default function NewsPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* 页面头部 */}
      <NewsHeader />

      {/* 动态内容列表 */}
      <NewsContent items={mockNewsItems} />
    </div>
  )
}
