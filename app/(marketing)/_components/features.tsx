'use client'

import { Highlighter } from '@/components/ui/highlighter'
import { useI18n } from '@/hooks/use-i18n'
import { AiChatDemo } from './features/ai-chat-demo'
import { AlbumCollage } from './features/album-collage'
import { LightOrDay } from './features/light-or-day'
import { AnimatedBeamMultipleOutputDemo } from './features/multi-format-importer'
import { NovelManagement } from './features/novel-management'
import { ThemeColorShowcase } from './features/theme-color-showcase'

export default function Features() {
  const { t } = useI18n()

  return (
    <>
      <section className="flex min-h-screen flex-col items-center relative overflow-hidden bg-background">
        <div className="container mx-auto px-4">

          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-medium text-foreground/80 tracking-wide">
              {t('marketing.features.title')}
            </h2>

            <p className="mt-4 text-sm font-serif italic text-foreground/50 max-w-xl mx-auto leading-relaxed">
              {t('marketing.features.subtitle')}
            </p>

            <div className="mt-8 w-14 h-[1.5px] bg-foreground/10 mx-auto rounded-full" />
          </div>
        </div>

        <div className="container mx-auto p-4">
          <div className="w-full flex flex-col gap-4">
            <div className="w-full">
              <AlbumCollage />
            </div>

            <div className="w-full">
              <LightOrDay />
            </div>

            <div className="w-full">
              <ThemeColorShowcase />
            </div>

            <div className="w-full flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-5/12">
                <AiChatDemo />
              </div>

              <div className="w-full md:w-7/12">
                <NovelManagement />
              </div>
            </div>

            <div className="w-full">
              <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col items-center text-center">
                <h3 className="text-lg text-foreground mb-3">
                  <Highlighter action="underline" color="var(--primary)">{t('marketing.features.multiFormatTitle')}</Highlighter>
                </h3>
                <span className="text-sm text-muted-foreground mb-4">{t('marketing.features.multiFormatDescription')}</span>
                <AnimatedBeamMultipleOutputDemo />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
