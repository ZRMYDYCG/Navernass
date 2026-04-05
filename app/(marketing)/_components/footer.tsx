'use client'

import { useI18n } from '@/hooks/use-i18n'

export default function Footer() {
  const { t } = useI18n()

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-4">
        <p className="text-sm text-muted-foreground text-center w-[60%] mx-auto">
          {t('marketing.footer.quote')}
        </p>
      </div>
    </footer>
  )
}
