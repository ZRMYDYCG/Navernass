'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { PublishHeader } from './_components/publish-header'
import { ChapterContent } from './_components/chapter-content'
import { ChapterNavigation } from './_components/chapter-navigation'
import { PublishFooter } from './_components/publish-footer'
import type { PublishSettings, PublishedNovel } from './types'

export default function PublishPage() {
  const searchParams = useSearchParams()
  const novelId = searchParams.get('id')

  const [novel, setNovel] = useState<PublishedNovel | null>(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [settings, setSettings] = useState<PublishSettings>({
    theme: 'light',
    fontSize: 'medium',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!novelId) {
      setError('未找到小说ID')
      setLoading(false)
      return
    }

    const fetchNovel = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/novels/${novelId}/published-chapters`)
        
        if (!response.ok) {
          throw new Error('获取小说数据失败')
        }

        const result = await response.json()
        
        if (!result.data) {
          throw new Error('小说数据为空')
        }

        if (result.data.chapters.length === 0) {
          throw new Error('该小说暂无已发布章节')
        }

        setNovel(result.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败')
      } finally {
        setLoading(false)
      }
    }

    fetchNovel()
  }, [novelId])

  const handleSettingsChange = (newSettings: Partial<PublishSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleChapterChange = (index: number) => {
    setCurrentChapterIndex(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (error || !novel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">{error || '未找到内容'}</p>
        </div>
      </div>
    )
  }

  const currentChapter = novel.chapters[currentChapterIndex]

  return (
    <div className="min-h-screen flex flex-col">
      <PublishHeader
        novelTitle={novel.title}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      <main className="flex-1">
        <ChapterContent chapter={currentChapter} fontSize={settings.fontSize} />
      </main>

      <ChapterNavigation
        chapters={novel.chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={handleChapterChange}
      />

      <PublishFooter />
    </div>
  )
}
