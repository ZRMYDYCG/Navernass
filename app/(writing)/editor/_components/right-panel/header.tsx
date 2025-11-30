'use client'

import { Clock, MessageSquarePlus } from 'lucide-react'
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
    <div className="h-10 flex px-3 items-center justify-end bg-[#FAF9F6] dark:bg-zinc-900 border-b border-stone-200/50 dark:border-zinc-800/50">
      <TooltipProvider>
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onNewChat}
                className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-200/50 dark:hover:bg-zinc-800 rounded-md transition-all duration-200 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
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
                className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-200/50 dark:hover:bg-zinc-800 rounded-md transition-all duration-200 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer"
              >
                <Clock className="w-4 h-4" />
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
