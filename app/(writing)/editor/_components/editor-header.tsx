'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react'
import { HeaderCenter } from './header-center'
import { HeaderLeft } from './header-left'
import { HeaderRight } from './header-right'

interface EditorHeaderProps {
  title?: string
  currentChapterId?: string | null
  isImmersiveMode?: boolean
  showLeftPanel: boolean
  onToggleLeftPanel: () => void
  onSelectChapter?: (chapterId: string) => void
  onToggleAI?: () => void
  onToggleTerminal?: () => void
  onLock?: () => void
  onToggleImmersiveMode?: () => void
  onBack?: () => void
  novelId?: string
  chapterIds?: string[]
  onOpenChapterSearch?: () => void
}

export default function EditorHeader({
  title = '未选择章节',
  currentChapterId,
  isImmersiveMode,
  showLeftPanel,
  onToggleLeftPanel,
  onSelectChapter,
  onToggleAI,
  onToggleTerminal,
  onLock,
  onToggleImmersiveMode,
  onBack,
  novelId,
  chapterIds,
  onOpenChapterSearch,
}: EditorHeaderProps) {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)

  interface HistoryState {
    history: string[]
    index: number
  }

  interface HistoryAction {
    type: 'navigate' | 'updateIndex'
    chapterId?: string
    index?: number
  }

  const [historyState, _dispatch] = useReducer((state: HistoryState, action: HistoryAction): HistoryState => {
    if (action.type === 'updateIndex' && action.index !== undefined) {
      return { ...state, index: action.index }
    }

    const { chapterId } = action
    const existingIndex = state.history.indexOf(chapterId!)

    if (existingIndex !== -1) {
      return { ...state, history: state.history.slice(0, existingIndex + 1), index: existingIndex }
    }

    if (state.index < state.history.length - 1) {
      return {
        ...state,
        history: [...state.history.slice(0, state.index + 1), chapterId!],
        index: state.index + 1,
      }
    }

    return { ...state, history: [...state.history, chapterId!], index: state.history.length }
  }, { history: [], index: -1 })

  const chapterHistory = historyState.history
  const historyIndex = historyState.index

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

    if (isNavigatingHistoryRef.current) {
      isNavigatingHistoryRef.current = false
      prevChapterIdRef.current = currentChapterId
      return
    }

    prevChapterIdRef.current = currentChapterId
    _dispatch({ type: 'navigate', chapterId: currentChapterId })
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
        _dispatch({ type: 'updateIndex', index: newIndex })
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
        _dispatch({ type: 'updateIndex', index: newIndex })
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
    <header className="h-9 flex items-center justify-between px-2 border-b border-border bg-background">
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
        isImmersiveMode={isImmersiveMode}
        onToggleImmersiveMode={onToggleImmersiveMode}
        novelId={novelId}
        chapterIds={chapterIds}
      />
    </header>
  )
}
