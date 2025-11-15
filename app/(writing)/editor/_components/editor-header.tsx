'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { HeaderCenter } from './header-center'
import { HeaderLeft } from './header-left'
import { HeaderRight } from './header-right'

interface EditorHeaderProps {
  title?: string
  showLeftPanel: boolean
  onToggleLeftPanel: () => void
  onToggleAI?: () => void
  onToggleTerminal?: () => void
  onBack?: () => void
}

export default function EditorHeader({
  title = '未选择章节',
  showLeftPanel,
  onToggleLeftPanel,
  onToggleAI,
  onToggleTerminal,
  onBack,
}: EditorHeaderProps) {
  const router = useRouter()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [chapterHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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
    if (canGoBack) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      // TODO: 切换到对应章节
    }
  }, [canGoBack, historyIndex])

  const handleGoForward = useCallback(() => {
    if (canGoForward) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      // TODO: 切换到对应章节
    }
  }, [canGoForward, historyIndex])

  // 标题点击（打开搜索弹窗）
  const handleTitleClick = useCallback(() => {
    // TODO: 打开搜索弹窗
    // eslint-disable-next-line no-console
    console.log('打开搜索弹窗')
  }, [])

  // 锁屏
  const handleLock = useCallback(() => {
    // TODO: 实现锁屏功能
    // eslint-disable-next-line no-console
    console.log('锁屏')
  }, [])

  // 关闭（返回上一路由）
  const handleClose = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  return (
    <header className="h-9 flex items-center justify-between px-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
      />
    </header>
  )
}
