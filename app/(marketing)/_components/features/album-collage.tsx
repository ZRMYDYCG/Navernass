'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Highlighter } from '@/components/ui/highlighter'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface ShowcaseImageProps {
  src: string
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
}

function ShowcaseImage({
  src,
  alt,
  className,
  loading = 'lazy',
}: ShowcaseImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      className={cn(
        'relative aspect-[16/9] overflow-hidden rounded-[calc(var(--radius)-2px)] border border-border/60 bg-muted/50',
        className,
      )}
    >
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60"
        >
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1280px) 1200px, 100vw"
        quality={90}
        draggable={false}
        onDragStart={(event) => {
          event.preventDefault()
        }}
        className={cn(
          'object-contain transition-opacity duration-500 ease-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
        )}
        loading={loading}
        onLoadingComplete={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        unoptimized
      />
    </div>
  )
}

export function AlbumCollage() {
  const { t } = useI18n()

  return (
    <section className="w-full rounded-[calc(var(--radius)+4px)] bg-background p-4 shadow-paper-md md:p-5">
      <div className="mb-4 flex flex-col items-center justify-center gap-3 text-center">
        <div>
          <h3 className="text-lg text-foreground">
            {t('marketing.albumCollage.versionLabel')}
            <Highlighter action="underline" color="var(--primary)">v0.14.0</Highlighter>
            {' '}
            ❤️
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('marketing.albumCollage.description')}
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border/70 bg-background/60 p-3 md:p-4">
        <ShowcaseImage
          src="/v0.14.0-day.png"
          alt={t('marketing.albumCollage.dayAlt')}
          className="dark:hidden"
          loading="eager"
        />
        <ShowcaseImage
          src="/v0.14.0-night.png"
          alt={t('marketing.albumCollage.nightAlt')}
          className="hidden dark:block"
        />
      </div>
    </section>
  )
}
