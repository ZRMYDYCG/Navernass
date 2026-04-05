'use client'

import { Highlighter } from '@/components/ui/highlighter'
import { useI18n } from '@/hooks/use-i18n'
import { ThemeVideo } from './theme-video'

export function AiChatDemo() {
  const { t } = useI18n()

  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
      <h3 className="text-lg mb-3 text-foreground">
        <Highlighter action="underline" color="var(--primary)">{t('marketing.aiChatDemo.title')}</Highlighter>
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t('marketing.aiChatDemo.description')}
      </p>

      <div className="relative w-full h-[300px] rounded-lg overflow-hidden border border-border bg-muted">
        <ThemeVideo
          lightSrc="/ai-day.mp4"
          darkSrc="/ai-night.mp4"
        />
      </div>
    </div>
  )
}
