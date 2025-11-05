'use client'

import {
  Bell,
  PanelLeftClose,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function ChatWelcomeHeader() {
  return (
    <TooltipProvider>
      <header className="h-16 flex items-center justify-between px-4 transition-colors">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
          >
            <PanelLeftClose className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            className="gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>新建对话</span>
          </Button>
        </div>

        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="relative text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 cursor-pointer"
              >
                <Bell className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>产品更新动态</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}
