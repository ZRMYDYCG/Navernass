'use client'

import {
  Lock,
  Maximize,
  Minimize,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import { ThemeSection } from '@/components/theme-select'

interface HeaderRightProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onToggleAI?: () => void
  onToggleTerminal?: () => void
  onLock?: () => void
  onClose?: () => void
}

export function HeaderRight({
  isFullscreen = false,
  onToggleFullscreen,
  onToggleAI,
  onToggleTerminal,
  onLock,
  onClose,
}: HeaderRightProps) {
  return (
    <div className="flex items-center gap-0.5 h-full">
      {/* 锁屏按钮 */}
      <button
        type="button"
        onClick={onLock}
        className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        title="锁屏"
      >
        <Lock className="w-4 h-4" />
      </button>

      {/* 终端按钮 */}
      <button
        type="button"
        onClick={onToggleTerminal}
        className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        title="打开终端"
      >
        <Terminal className="w-4 h-4" />
      </button>

      {/* AI 按钮 */}
      <button
        type="button"
        onClick={onToggleAI}
        className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        title="AI 助手"
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* 主题切换按钮 */}
      <div className="[&_button]:p-1.5 [&_button]:h-7 [&_button]:w-7 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:hover:bg-gray-200 [&_button]:dark:hover:bg-gray-700 [&_button]:rounded [&_button]:transition-colors [&_button]:text-gray-600 [&_button]:dark:text-gray-400 [&_button]:hover:text-gray-900 [&_button]:dark:hover:text-gray-100 [&_button]:border-0 [&_button]:bg-transparent [&_button]:cursor-pointer [&_svg]:w-4 [&_svg]:h-4">
        <ThemeSection />
      </div>

      {/* 全屏切换按钮 */}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        title={isFullscreen ? '退出全屏' : '全屏'}
      >
        {isFullscreen
          ? <Minimize className="w-4 h-4" />
          : <Maximize className="w-4 h-4" />}
      </button>

      {/* 关闭按钮 */}
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        title="返回"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
