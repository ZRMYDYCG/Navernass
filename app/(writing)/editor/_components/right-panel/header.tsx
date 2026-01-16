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
    <div className="h-9 flex px-2 items-center justify-end bg-background">
      <TooltipProvider>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onNewChat}
                className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded-sm transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
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
                className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded-sm transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5" />
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
