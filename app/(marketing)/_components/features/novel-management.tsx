'use client'

import { Highlighter } from '@/components/ui/highlighter'
import { useI18n } from '@/hooks/use-i18n'
import { ThemeVideo } from './theme-video'

export function NovelManagement() {
  const { t } = useI18n()

  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <div className="flex items-center justify-center mb-4">
        <h3 className="text-lg text-foreground">
          <Highlighter action="underline" color="var(--primary)">{t('marketing.novelManagement.title')}</Highlighter>
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {t('marketing.novelManagement.description')}
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <ThemeVideo
          lightSrc="/wirte-day.mp4"
          darkSrc="/wirte-night.mp4"
        />
      </div>
    </div>
  )
}
