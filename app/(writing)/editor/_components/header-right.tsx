'use client'

import { useState } from 'react'
import {
  LockKeyhole,
  Maximize2,
  Minimize2,
  Bot,
  Globe,
  XCircle,
} from 'lucide-react'
import { ThemeSection } from '@/components/theme-select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { PublishDialog } from './publish-dialog'

interface HeaderRightProps {
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onToggleAI?: () => void
  onToggleTerminal?: () => void
  onLock?: () => void
  onClose?: () => void
  novelId?: string
  chapterIds?: string[]
}

export function HeaderRight({
  isFullscreen = false,
  onToggleFullscreen,
  onToggleAI,
  onToggleTerminal,
  onLock,
  onClose,
  novelId,
  chapterIds = [],
}: HeaderRightProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setPublishDialogOpen(true)}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              <Globe className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>发布</p>
          </TooltipContent>
        </Tooltip>

        {/* 锁屏按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onLock}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              <LockKeyhole className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>锁屏</p>
          </TooltipContent>
        </Tooltip>

        {/* 终端按钮 */}
        {/* <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleTerminal}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              <TerminalSquare className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>打开终端</p>
          </TooltipContent>
        </Tooltip> */}

        {/* AI 按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleAI}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              <Bot className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI 助手</p>
          </TooltipContent>
        </Tooltip>

        {/* 主题切换按钮 */}
        <div className="[&_button]:p-1.5 [&_button]:h-7 [&_button]:w-7 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:hover:bg-gray-200 [&_button]:dark:hover:bg-gray-700 [&_button]:rounded [&_button]:transition-colors [&_button]:text-gray-600 [&_button]:dark:text-gray-400 [&_button]:hover:text-gray-900 [&_button]:dark:hover:text-gray-100 [&_button]:border-0 [&_button]:bg-transparent [&_button]:cursor-pointer [&_svg]:w-4 [&_svg]:h-4">
          <ThemeSection />
        </div>

        {/* 全屏切换按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              {isFullscreen
                ? <Minimize2 className="w-4 h-4" />
                : <Maximize2 className="w-4 h-4" />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? '退出全屏' : '全屏'}</p>
          </TooltipContent>
        </Tooltip>

        {/* 关闭按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>返回</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        novelId={novelId}
        chapterIds={chapterIds}
      />
    </TooltipProvider>
  )
}
