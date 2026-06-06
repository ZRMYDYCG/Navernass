'use client'

import { ArrowDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

interface ScrollToBottomButtonProps {
  onClick: () => void
  show: boolean
}

export function ScrollToBottomButton({ onClick, show }: ScrollToBottomButtonProps) {
  const { t } = useI18n()

  if (!show)
    return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <Button
        onClick={onClick}
        size="icon"
        className="pointer-events-auto h-9 w-9 rounded-full bg-card text-foreground hover:bg-accent border border-border shadow-paper-sm"
        variant="outline"
        aria-label={t('editor.rightPanel.scrollToBottom')}
      >
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
