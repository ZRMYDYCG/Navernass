'use client'

import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface FeatureGifProps {
  src: string
  alt?: string
  className?: string
}

export function FeatureGif({ src, alt = '', className }: FeatureGifProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const node = containerRef.current
    if (!node || shouldLoad) return

    if (typeof IntersectionObserver === 'undefined') {
      const frame = window.requestAnimationFrame(() => setShouldLoad(true))
      return () => window.cancelAnimationFrame(frame)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(entry => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '900px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [shouldLoad])

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {!isLoaded && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60"
          aria-hidden
        >
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      )}
      {shouldLoad && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn(
            'pointer-events-none h-full w-full select-none object-cover object-top transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            className,
          )}
          draggable={false}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsLoaded(true)}
        />
      )}
    </div>
  )
}
