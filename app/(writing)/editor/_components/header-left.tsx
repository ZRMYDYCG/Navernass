'use client'

import { LayoutPanelLeft, Users } from 'lucide-react'
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleLeftPanel}
              className={`p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                showLeftPanel
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <LayoutPanelLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showLeftPanel ? '隐藏左侧面板' : '显示左侧面板'}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>角色图谱</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
