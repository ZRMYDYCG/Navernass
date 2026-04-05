'use client'

import { Clock, MessageSquarePlus } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'

interface HeaderProps {
  onNewChat?: () => void
  onShowHistory?: () => void
}

export function Header({ onNewChat, onShowHistory }: HeaderProps) {
  const { t } = useI18n()

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
                aria-label={t('editor.rightPanel.newChat')}
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('editor.rightPanel.newChat')}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onShowHistory}
                className="h-6 w-6 flex items-center justify-center hover:bg-accent rounded-sm transition-all duration-200 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={t('editor.rightPanel.historyButton')}
              >
                <Clock className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('editor.rightPanel.historyButton')}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
}
