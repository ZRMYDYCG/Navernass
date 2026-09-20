'use client'

import { useI18n } from '@/hooks/use-i18n'

export function MessageErrorFallback({
  error,
  onRetry,
}: {
  error: Error
  onRetry: () => void
}) {
  const { t } = useI18n()

  return (
    <div className="m-2 rounded border border-destructive/40 bg-destructive/10 p-3 text-[11px] text-destructive">
      <div className="font-medium mb-1">{t('editor.rightPanel.messageRenderError')}</div>
      <div className="text-foreground/70 mb-2 break-all">
        {error.message}
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="underline text-foreground hover:opacity-80"
      >
        {t('editor.rightPanel.retry')}
      </button>
    </div>
  )
}
