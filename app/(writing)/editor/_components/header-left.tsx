'use client'

import { LayoutPanelLeft } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HeaderLeftProps {
  showLeftPanel: boolean
  onToggleLeftPanel: () => void
}

export function HeaderLeft({ showLeftPanel, onToggleLeftPanel }: HeaderLeftProps) {
  return (
    <div className="flex items-center gap-1.5 h-full">

      {/* 左侧面板折叠按钮 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleLeftPanel}
              className={`p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                showLeftPanel
                  ? 'text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-stone-800'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <LayoutPanelLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showLeftPanel ? '隐藏左侧面板' : '显示左侧面板'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
