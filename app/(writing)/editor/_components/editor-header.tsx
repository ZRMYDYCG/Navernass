'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { HeaderCenter } from './header-center'
import { HeaderLeft } from './header-left'
import { HeaderRight } from './header-right'

interface EditorHeaderProps {
  title?: string
  currentChapterId?: string | null
  showLeftPanel: boolean
  onToggleLeftPanel: () => void
  onSelectChapter?: (chapterId: string) => void
  onToggleAI?: () => void
  onToggleTerminal?: () => void
  onLock?: () => void
  onBack?: () => void
  novelId?: string
  chapterIds?: string[]
  onOpenChapterSearch?: () => void
}

export default function EditorHeader({
  title = '未选择章节',
  currentChapterId,
  showLeftPanel,
  onToggleLeftPanel,
  onSelectChapter,
  onToggleAI,
  onToggleTerminal,
  onLock,
  onBack,
  novelId,
  chapterIds = [],
  onOpenChapterSearch,
}: EditorHeaderProps) {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chapterHistory, setChapterHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const prevChapterIdRef = useRef<string | null | undefined>(null)
  const isNavigatingHistoryRef = useRef(false)

  // 当章节切换时，更新历史记录
  useLayoutEffect(() => {
    if (!currentChapterId || currentChapterId === prevChapterIdRef.current) {
      if (currentChapterId) {
        prevChapterIdRef.current = currentChapterId
      }
      return
    }

    // 如果是通过历史导航切换的，只更新索引，不修改历史记录
    if (isNavigatingHistoryRef.current) {
      isNavigatingHistoryRef.current = false
      prevChapterIdRef.current = currentChapterId
      return
    }

    prevChapterIdRef.current = currentChapterId

    setChapterHistory((prev) => {
      // 如果当前章节已经在历史记录中，移除它后面的记录
      const existingIndex = prev.indexOf(currentChapterId)
      if (existingIndex !== -1) {
        const newHistory = prev.slice(0, existingIndex + 1)
        setHistoryIndex(newHistory.length - 1)
        return newHistory
      }

      // 获取当前历史索引并更新
      setHistoryIndex((currentHistoryIndex) => {
        let newHistory: string[]

        // 如果当前在历史记录的中间位置，移除后面的记录
        if (currentHistoryIndex < prev.length - 1) {
          newHistory = prev.slice(0, currentHistoryIndex + 1)
          newHistory.push(currentChapterId)
        } else {
          // 添加新章节到历史记录
          newHistory = [...prev, currentChapterId]
        }

        setChapterHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
        return newHistory.length - 1
      })

      return prev
    })
  }, [currentChapterId])

  // 全屏切换
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
      }).catch(() => {
        // 全屏请求失败
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
      }).catch(() => {
        // 退出全屏失败
      })
    }
  }, [])

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // 章节历史导航
  const canGoBack = historyIndex > 0
  const canGoForward = historyIndex < chapterHistory.length - 1

  const handleGoBack = useCallback(() => {
    if (canGoBack && onSelectChapter) {
      const newIndex = historyIndex - 1
      const prevChapterId = chapterHistory[newIndex]
      if (prevChapterId) {
        isNavigatingHistoryRef.current = true
        setHistoryIndex(newIndex)
        onSelectChapter(prevChapterId)
      }
    }
  }, [canGoBack, historyIndex, chapterHistory, onSelectChapter])

  const handleGoForward = useCallback(() => {
    if (canGoForward && onSelectChapter) {
      const newIndex = historyIndex + 1
      const nextChapterId = chapterHistory[newIndex]
      if (nextChapterId) {
        isNavigatingHistoryRef.current = true
        setHistoryIndex(newIndex)
        onSelectChapter(nextChapterId)
      }
    }
  }, [canGoForward, historyIndex, chapterHistory, onSelectChapter])

  const handleTitleClick = useCallback(() => {
    if (onOpenChapterSearch) {
      onOpenChapterSearch()
    }
  }, [onOpenChapterSearch])

  // 锁屏
  const handleLock = useCallback(() => {
    if (onLock) {
      onLock()
    }
  }, [onLock])

  // 关闭（返回上一路由）
  const handleClose = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  return (
    <header className="h-9 flex items-center justify-between px-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-900">
      {/* 左侧：Logo + 折叠按钮 */}
      <HeaderLeft
        showLeftPanel={showLeftPanel}
        onToggleLeftPanel={onToggleLeftPanel}
      />

      {/* 中间：历史导航 + 标题搜索框 */}
      <HeaderCenter
        title={title}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onTitleClick={handleTitleClick}
      />

      {/* 右侧：锁屏 + 终端 + AI + 全屏 + 关闭 */}
      <HeaderRight
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleAI={onToggleAI}
        onToggleTerminal={onToggleTerminal}
        onLock={handleLock}
        onClose={handleClose}
        novelId={novelId}
        chapterIds={chapterIds}
      />
    </header>
  )
}
