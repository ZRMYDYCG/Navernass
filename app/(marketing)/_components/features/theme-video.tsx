'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import { cn } from '@/lib/utils'

interface ThemeVideoProps {
  lightSrc: string
  darkSrc: string
  posterSrc?: string
  className?: string
}

export function ThemeVideo({ lightSrc, darkSrc, className }: ThemeVideoProps) {
  const { resolvedTheme } = useThemeTransition()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)

  const src = useMemo(
    () => (resolvedTheme === 'dark' ? darkSrc : lightSrc),
    [darkSrc, lightSrc, resolvedTheme],
  )

  const isLoaded = loadedSrc === src

  useEffect(() => {
    const node = videoRef.current
    if (!node || shouldLoad) return

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => {
        setShouldLoad(true)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '280px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div className="relative h-full w-full">
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 animate-pulse bg-muted"
          aria-hidden
        />
      )}
      <video
        ref={videoRef}
        src={shouldLoad ? src : undefined}
        className={cn(
          'pointer-events-none h-full w-full select-none object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        tabIndex={-1}
        aria-hidden
        autoPlay={shouldLoad}
        loop
        muted
        playsInline
        preload="none"
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        onContextMenu={(event) => {
          event.preventDefault()
        }}
        onLoadedData={(event) => {
          const currentSrc = event.currentTarget.currentSrc
          if (!currentSrc) return
          try {
            setLoadedSrc(new URL(currentSrc).pathname)
          } catch {
            setLoadedSrc(src)
          }
        }}
        onCanPlay={() => setLoadedSrc(src)}
        onError={() => setLoadedSrc(src)}
      />
    </div>
  )
}
