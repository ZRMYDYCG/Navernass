'use client'

import { useI18n } from '@/hooks/use-i18n'

export function EmptyState() {
  const { t } = useI18n()

  return (
    <div className="flex flex-col items-center justify-start pt-[40vh] min-h-[60vh] text-muted-foreground font-serif">
      <p className="text-lg">{t('trash.empty.title')}</p>
      <p className="text-sm text-muted-foreground/70 text-center mt-2">
        {t('trash.empty.description')}
      </p>
    </div>
  )
}
