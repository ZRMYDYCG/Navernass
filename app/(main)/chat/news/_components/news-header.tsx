'use client'

import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

export function NewsHeader() {
  const router = useRouter()
  const { t } = useI18n()

  return (
    <header className="relative flex flex-col items-center justify-center py-12 px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => router.back()}
        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        aria-label={t('chat.news.close')}
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {t('chat.news.title')}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t('chat.news.subtitle')}
        </p>
      </div>
    </header>
  )
}
