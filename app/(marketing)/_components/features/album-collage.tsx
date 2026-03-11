'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Highlighter } from '@/components/ui/highlighter'
import { cn } from '@/lib/utils'

interface CollageImageProps {
  src: string
  alt: string
  sizes: string
  quality: number
  className?: string
  wrapperClassName?: string
  loading?: 'eager' | 'lazy'
}

function CollageImage({
  src,
  alt,
  sizes,
  quality,
  className,
  wrapperClassName,
  loading = 'lazy',
}: CollageImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div
      className={cn(
        'relative aspect-[2/1] overflow-hidden rounded-[calc(var(--radius)-6px)] border border-border/60 bg-muted/50',
        wrapperClassName,
      )}
    >
      {!isLoaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 animate-pulse bg-muted"
        />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={quality}
        className={cn(
          'object-cover transition-[transform,opacity] duration-500 ease-out',
          isLoaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
        loading={loading}
        onLoadingComplete={() => setIsLoaded(true)}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
      />
    </div>
  )
}

function PhotoPin({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2 -translate-y-1/2',
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <div className="relative h-4 w-4 rounded-full border border-primary/60 bg-destructive/80 shadow-paper-sm">
          <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/70" />
          <div className="absolute inset-0 rounded-full ring-1 ring-primary/20" />
        </div>
        <div className="-mt-0.5 h-3 w-[2px] rounded-full bg-primary/35 shadow-paper-sm" />
      </div>
    </div>
  )
}

const LANDING_IMAGES = [
  '/images/landingpage/01c3cd90f826d7e4ae8d90d365894eae.png',
  '/images/landingpage/0cca92647217e848b0459cc6bd7d9e5d.png',
  '/images/landingpage/1f70a81535e5ef796e09487133db44aa.png',
  '/images/landingpage/20b4bd21996e28c2453808a75236e4bc.png',
  '/images/landingpage/2bb5a46da800a6e8d0eb39fb6f24176d.png',
  '/images/landingpage/3f86b14e5cbce19bdac9d589346fbbea.png',
  '/images/landingpage/42a9cb91c9e3b8426e71853f7dee0651.png',
  '/images/landingpage/4397d38f2b3a3289dacec399b5f4cc59.png',
  '/images/landingpage/63e5c94d255e75ccabe5ca54e35ddb0d.png',
  '/images/landingpage/a87cab7d9b1a8492fbbbcf66ef0d2250.png',
  '/images/landingpage/c239bdf68ff856567047117ec97bb2c0.png',
  '/images/landingpage/d601379664c81b2b9eb2f822c063627f.png',
  '/images/landingpage/e379c4dfb6df620ff9542845210114cc.png',
  '/images/landingpage/f0eaf48b7de60dc39f08a94b53526927.png',
] as const

const DESKTOP_LAYOUT = [
  { top: '6%', left: '2%', width: 'clamp(200px, 18vw, 320px)', rotate: -8, depth: 4 },
  { top: '9%', left: '18%', width: 'clamp(190px, 16vw, 290px)', rotate: -3, depth: 7 },
  { top: '5%', left: '34%', width: 'clamp(210px, 18vw, 330px)', rotate: 6, depth: 5 },
  { top: '10%', left: '53%', width: 'clamp(185px, 16vw, 280px)', rotate: -5, depth: 8 },
  { top: '7%', left: '69%', width: 'clamp(200px, 17vw, 305px)', rotate: 4, depth: 6 },
  { top: '33%', left: '8%', width: 'clamp(205px, 17vw, 315px)', rotate: 7, depth: 7 },
  { top: '30%', left: '24%', width: 'clamp(185px, 16vw, 285px)', rotate: -6, depth: 5 },
  { top: '36%', left: '41%', width: 'clamp(210px, 18vw, 330px)', rotate: 5, depth: 10 },
  { top: '32%', left: '58%', width: 'clamp(190px, 16vw, 295px)', rotate: -8, depth: 6 },
  { top: '35%', left: '75%', width: 'clamp(180px, 15vw, 270px)', rotate: 4, depth: 8 },
  { top: '61%', left: '15%', width: 'clamp(210px, 18vw, 330px)', rotate: -4, depth: 11 },
  { top: '57%', left: '34%', width: 'clamp(190px, 16vw, 300px)', rotate: 6, depth: 9 },
  { top: '62%', left: '53%', width: 'clamp(205px, 17vw, 315px)', rotate: -5, depth: 10 },
  { top: '58%', left: '70%', width: 'clamp(190px, 16vw, 290px)', rotate: 3, depth: 9 },
] as const

export function AlbumCollage() {
  const [activeIndex, setActiveIndex] = useState(8)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="w-full rounded-[calc(var(--radius)+4px)] bg-background p-4 shadow-paper-md md:p-5">
      <div className="mb-4 flex flex-col items-center justify-center gap-3 text-center">
        <div>
          <h3 className="text-lg text-foreground">
            版本号：
            <Highlighter action="underline" color="var(--primary)">v0.10.0</Highlighter>
            {' '}
            ❤️
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Narraverse 正在变得越来越好，我们也在不断地收集大家的反馈和建议来改进产品。
          </p>
        </div>
      </div>

      <div className="rounded-[var(--radius)] border border-border/70 bg-background/60 p-3 md:p-4">
        <div className="relative hidden h-[640px] overflow-hidden rounded-[calc(var(--radius)-2px)] bg-paper-texture md:block">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/50 via-transparent to-background/20" />
          {LANDING_IMAGES.map((src, index) => {
            const layout = DESKTOP_LAYOUT[index]
            const isActive = activeIndex === index

            return (
              <button
                key={src}
                type="button"
                className="group absolute text-left focus-visible:outline-none"
                style={{
                  top: layout.top,
                  left: layout.left,
                  width: layout.width,
                  zIndex: hoveredIndex === index ? 80 : isActive ? 60 : layout.depth,
                }}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                aria-label={`Focus photo ${index + 1}`}
              >
                <div
                  className={cn(
                    'relative rounded-[calc(var(--radius)-2px)] border border-border/80 bg-popover p-2 transition-all duration-300 ease-out',
                    isActive
                      ? 'translate-y-[-6px] scale-[1.04] shadow-paper-lg'
                      : 'hover:translate-y-[-5px] hover:scale-[1.03] hover:shadow-paper-lg',
                  )}
                  style={{ rotate: `${isActive ? 0 : layout.rotate}deg` }}
                >
                  <PhotoPin />
                  <CollageImage
                    src={src}
                    alt={`Landing album photo ${index + 1}`}
                    sizes="(min-width: 1536px) 320px, (min-width: 1280px) 290px, (min-width: 1024px) 250px, 220px"
                    quality={95}
                    className={cn(
                      isActive ? 'scale-[1.03]' : 'group-hover:scale-[1.06]',
                    )}
                  />
                </div>
              </button>
            )
          })}
        </div>

        <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2 md:hidden">
          {LANDING_IMAGES.map((src, index) => {
            const isActive = activeIndex === index
            const rotate = index % 2 === 0 ? '-2deg' : '2deg'

            return (
              <button
                key={src}
                type="button"
                className="w-[84vw] max-w-[360px] shrink-0 snap-center text-left focus-visible:outline-none"
                onClick={() => setActiveIndex(index)}
                aria-label={`Focus photo ${index + 1}`}
              >
                <div
                  className={cn(
                    'relative rounded-[var(--radius)] border border-border bg-popover p-2 transition-all duration-300',
                    isActive ? 'shadow-paper-md ring-2 ring-ring' : 'shadow-paper-sm',
                  )}
                  style={{ rotate }}
                >
                  <PhotoPin className="top-2" />
                  <CollageImage
                    src={src}
                    alt={`Landing album photo ${index + 1}`}
                    sizes="360px"
                    quality={95}
                  />
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
