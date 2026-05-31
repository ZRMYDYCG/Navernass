'use client'

import Image from 'next/image'
import { useI18n } from '@/hooks/use-i18n'

interface EmptyChaptersProps {
  onCreateChapter?: () => void
  onCreateVolume?: () => void
}

export function EmptyChapters(_props: EmptyChaptersProps) {
  const { t } = useI18n()

  return (
    <div className="relative flex h-full items-center justify-center overflow-visible p-6">
      <div className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block">
        <div className="absolute top-[18%] left-[12%] h-[0.5px] w-[58%] rotate-[-14deg] bg-gradient-to-r from-transparent via-violet-500/45 to-transparent animate-pulse [animation-duration:3s]" />
        <div className="absolute top-[38%] right-[4%] h-[0.5px] w-[52%] rotate-[9deg] bg-gradient-to-r from-transparent via-sky-400/45 to-transparent animate-pulse [animation-duration:4.2s] [animation-delay:0.4s]" />
        <div className="absolute top-[64%] left-[16%] h-[0.5px] w-[46%] rotate-[-7deg] bg-gradient-to-r from-transparent via-pink-400/35 to-transparent animate-pulse [animation-duration:3.6s] [animation-delay:0.9s]" />
        <div className="absolute top-[82%] right-[10%] h-[0.5px] w-[42%] rotate-[5deg] bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent animate-pulse [animation-duration:4.6s] [animation-delay:1.4s]" />
      </div>

      <div className="relative z-10 max-w-sm text-center">
        <div className="mx-auto mb-3 flex items-center justify-center text-muted-foreground">
          <Image
            src="/assets/svg/logo-dark.svg"
            width={52}
            height={52}
            alt={t('editor.logoAlt')}
            className="dark:hidden"
          />
          <Image
            src="/assets/svg/logo-light.svg"
            width={52}
            height={52}
            alt={t('editor.logoAlt')}
            className="hidden dark:block"
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {t('editor.leftPanel.chapters.empty.subtitle')}
        </p>
      </div>
    </div>
  )
}
