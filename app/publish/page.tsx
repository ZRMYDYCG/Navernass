"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [showBackToTop, setShowBackToTop] = useState(false)

  const scrollToTop = () => {
    const startY = window.scrollY || window.pageYOffset
    if (startY === 0) return

    const start = performance.now()
    const duration = 400

    const step = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const y = startY * (1 - eased)
      window.scrollTo(0, y)
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }

    window.requestAnimationFrame(step)
  }

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

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300)
    }
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSettingsChange = (newSettings: Partial<PublishSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }

  const handleChapterChange = (index: number) => {
    setCurrentChapterIndex(index)
    scrollToTop()
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
        volumes={novel.volumes}
        chapters={novel.chapters}
        currentChapterIndex={currentChapterIndex}
        onChapterChange={handleChapterChange}
      />

      <PublishFooter />

      {showBackToTop && (
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="fixed bottom-6 right-6 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
