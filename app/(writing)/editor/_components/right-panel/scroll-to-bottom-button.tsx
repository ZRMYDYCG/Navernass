'use client'

import { ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

interface ScrollToBottomButtonProps {
  onClick: () => void
  show: boolean
}

export function ScrollToBottomButton({ onClick, show }: ScrollToBottomButtonProps) {
  if (!show)
    return null

  const { t } = useI18n()

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
      <Button
        onClick={onClick}
        size="icon"
        className="h-9 w-9 rounded-full shadow-lg bg-background text-foreground hover:bg-accent border border-border transition-opacity"
        variant="outline"
        title={t('editor.rightPanel.scrollToBottom')}
      >
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
