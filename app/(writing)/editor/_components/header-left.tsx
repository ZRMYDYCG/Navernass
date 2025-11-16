'use client'

import { PanelLeft } from 'lucide-react'
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
              className={`p-1.5 h-7 w-7 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${
                showLeftPanel
                  ? 'text-gray-900 dark:text-gray-100'
                  : 'text-gray-400 dark:text-gray-600'
              }`}
            >
              <PanelLeft className="w-4 h-4" />
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
