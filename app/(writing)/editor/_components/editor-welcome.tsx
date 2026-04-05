'use client'

import Image from 'next/image'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/hooks/use-i18n'

export function EditorWelcome() {
  const { t } = useI18n()

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="min-h-full flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 text-muted-foreground">
          <Image
            src="/assets/svg/pen-light.svg"
            width={120}
            height={120}
            alt={t('editor.welcome.alt')}
            className="opacity-40 dark:hidden"
            priority
          />
          <Image
            src="/assets/svg/pen-dark.svg"
            width={120}
            height={120}
            alt={t('editor.welcome.alt')}
            className="opacity-40 hidden dark:block"
            priority
          />
          <p className="text-sm">{t('editor.welcome.selectChapter')}</p>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>S</Kbd>
            <span>{t('editor.welcome.shortcuts.save')}</span>
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>E</Kbd>
            <span>{t('editor.welcome.shortcuts.toggleLeftPanel')}</span>
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>+</Kbd>
            <Kbd>L</Kbd>
            <span>{t('editor.welcome.shortcuts.toggleRightPanel')}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
