'use client'

import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'

export function MarketingSkeleton() {
  const { t } = useI18n()
  const label = t('marketing.skeleton.loading')

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background bg-paper-texture">
      <div className="flex flex-col items-center gap-4">
        <Spinner variant="pen" className="text-primary" label={label} />
        <p className="animate-text-fade-in font-serif text-sm text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  )
}
