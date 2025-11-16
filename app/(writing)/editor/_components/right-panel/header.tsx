'use client'

import { History, Plus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface HeaderProps {
  onNewChat?: () => void
  onShowHistory?: () => void
}

export function Header({ onNewChat, onShowHistory }: HeaderProps) {
  return (
    <div className="h-7 flex px-1.5 items-center justify-end bg-gray-100 dark:bg-gray-800">
      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onNewChat}
                className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>新建对话</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onShowHistory}
                className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <History className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>历史记录</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
