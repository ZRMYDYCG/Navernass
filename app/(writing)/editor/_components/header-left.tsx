'use client'

import { LayoutPanelLeft, MessageCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'

interface HeaderLeftProps {
  showLeftPanel: boolean
  showRightPanel?: boolean
  onToggleLeftPanel: () => void
  onToggleAI?: () => void
}

export function HeaderLeft({
  showLeftPanel,
  showRightPanel = false,
  onToggleLeftPanel,
  onToggleAI,
}: HeaderLeftProps) {
  const { t } = useI18n()

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
            <p>{showLeftPanel ? t('editor.header.hideLeftPanel') : t('editor.header.showLeftPanel')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleAI}
              className={`p-1.5 h-7 w-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
                showRightPanel
                  ? 'text-foreground bg-accent'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('editor.header.aiAssistant')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
