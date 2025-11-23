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

  const buttonClass = "p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer"
  const iconProps = { className: "w-3.5 h-3.5", strokeWidth: 1.5 }

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 h-full">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setPublishDialogOpen(true)}
              className={buttonClass}
            >
              <Globe {...iconProps} />
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
              className={buttonClass}
            >
              <LockKeyhole {...iconProps} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>锁屏</p>
          </TooltipContent>
        </Tooltip>

        {/* AI 按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleAI}
              className={buttonClass}
            >
              <Bot {...iconProps} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>AI 助手</p>
          </TooltipContent>
        </Tooltip>

        {/* 主题切换按钮 - Custom styling wrapper to match */}
        <div className={`[&_button]:${buttonClass.replace(/ /g, ' [&_button]:')} [&_svg]:w-3.5 [&_svg]:h-3.5 [&_svg]:stroke-[1.5]`}>
          <ThemeSection />
        </div>

        {/* 全屏切换按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleFullscreen}
              className={buttonClass}
            >
              {isFullscreen
                ? <Minimize2 {...iconProps} />
                : <Maximize2 {...iconProps} />}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isFullscreen ? '退出全屏' : '全屏'}</p>
          </TooltipContent>
        </Tooltip>

        {/* 分隔线 */}
        <div className="w-px h-3 bg-stone-200 dark:bg-stone-700 mx-1" />

        {/* 关闭按钮 */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 text-stone-400 hover:text-red-500 dark:text-stone-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
            >
              <XCircle {...iconProps} />
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
