'use client'

import {
  AlignLeft,
  GripVertical,
  Moon,
  Search,
  Settings,
  Share2,
  Sun,
  Type,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Highlighter } from '@/components/ui/highlighter'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

interface LightOrDayDemo {
  library: string
  currentNovel: string
  publish: string
  chapterTitle: string
  paragraphs: string[]
  highlight: string
  lineAndColumn: string
  wordCount: string
}

export function LightOrDay() {
  const { t } = useI18n()
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const darkScrollRef = useRef<HTMLDivElement>(null)
  const lightScrollRef = useRef<HTMLDivElement>(null)
  const isSyncingScrollRef = useRef(false)
  const rawDemo = t('marketing.lightOrDay.demo', { returnObjects: true }) as unknown
  const demo = rawDemo as LightOrDayDemo

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))

      setSliderPosition(percentage)
    },
    [],
  )

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleTouchStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      handleMove(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      handleMove(e.touches[0].clientX)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove)
      document.addEventListener('touchend', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMove])

  const handleContentScroll = useCallback((source: 'light' | 'dark', scrollTop: number) => {
    if (isSyncingScrollRef.current) return

    const targetRef = source === 'light' ? darkScrollRef : lightScrollRef
    const target = targetRef.current
    if (!target) return

    isSyncingScrollRef.current = true
    target.scrollTop = scrollTop
    requestAnimationFrame(() => {
      isSyncingScrollRef.current = false
    })
  }, [])

  return (
    <div className="w-full h-full p-4 bg-background rounded-lg flex flex-col shadow-none">
      <div className="flex flex-col items-center justify-center mb-4 text-center">
        <div>
          <h3 className="text-lg mb-3 text-foreground">
            <Highlighter action="underline" color="var(--primary)">{t('marketing.lightOrDay.title')}</Highlighter>
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            {t('marketing.lightOrDay.description')}
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[500px] rounded-xl overflow-hidden border border-border/50 shadow-2xl select-none cursor-ew-resize touch-none ring-1 ring-black/5 dark:ring-white/10 group"
      >
        {/* Dark Mode (Bottom Layer) */}
        <div className="absolute inset-0">
          <DemoContent
            theme="dark"
            contentRef={darkScrollRef}
            onContentScroll={scrollTop => handleContentScroll('dark', scrollTop)}
            demo={demo}
          />
        </div>

        {/* Light Mode (Top Layer) */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <DemoContent
            theme="light"
            contentRef={lightScrollRef}
            onContentScroll={scrollTop => handleContentScroll('light', scrollTop)}
            demo={demo}
          />
        </div>

        {/* Slider Handle */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white/50 z-20"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute inset-y-0 -left-px w-0.5 bg-primary/50 shadow-[0_0_10px_rgba(0,0,0,0.2)]" />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background border-2 border-primary rounded-full shadow-lg flex items-center justify-center text-primary transition-transform duration-150 group-hover:scale-110 active:scale-95 z-30 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <GripVertical className="w-4 h-4" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-medium text-white/90 border border-white/10 shadow-lg pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {t('marketing.lightOrDay.darkMode')}
        </div>
        <div className="absolute bottom-4 right-4 z-10 px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-xs font-medium text-black/90 border border-black/5 shadow-lg pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          {t('marketing.lightOrDay.lightMode')}
        </div>
      </div>
    </div>
  )
}

function DemoContent({
  theme,
  contentRef,
  onContentScroll,
  demo,
}: {
  theme: 'light' | 'dark'
  contentRef: React.RefObject<HTMLDivElement | null>
  onContentScroll: (scrollTop: number) => void
  demo: LightOrDayDemo
}) {
  const isLight = theme === 'light'

  const styles = {
    bg: isLight ? 'bg-[#ffffff]' : 'bg-[#09090b]',
    text: isLight ? 'text-zinc-800' : 'text-zinc-300',
    selection: isLight ? 'selection:bg-blue-100 selection:text-blue-900' : 'selection:bg-blue-900/50 selection:text-blue-100',
    border: isLight ? 'border-zinc-200' : 'border-zinc-800',
    mutedText: isLight ? 'text-zinc-500' : 'text-zinc-400',
  }

  return (
    <div className={cn(
      'w-full h-full flex flex-col overflow-hidden transition-colors duration-300 font-sans antialiased',
      styles.bg,
      styles.text,
      styles.selection,
    )}
    >
      {/* Window Header / Toolbar */}
      <div className={cn(
        'h-12 border-b flex items-center justify-between px-4 shrink-0 backdrop-blur-sm z-10',
        isLight ? 'border-zinc-200 bg-white/80' : 'border-zinc-800 bg-zinc-950/80',
      )}
      >
        {/* Left: Window Controls & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5 group">
            <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-red-400/80' : 'bg-red-500/20 group-hover:bg-red-500/60 transition-colors')} />
            <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-amber-400/80' : 'bg-amber-500/20 group-hover:bg-amber-500/60 transition-colors')} />
            <div className={cn('w-3 h-3 rounded-full', isLight ? 'bg-green-400/80' : 'bg-green-500/20 group-hover:bg-green-500/60 transition-colors')} />
          </div>
          <div className={cn('h-4 w-px mx-2', isLight ? 'bg-zinc-200' : 'bg-zinc-800')} />
          <div className="flex items-center gap-2 text-xs font-medium opacity-80">
            <span className={isLight ? 'text-zinc-500' : 'text-zinc-500'}>{demo.library}</span>
            <span className={isLight ? 'text-zinc-500' : 'text-zinc-500'}>/</span>
            <span>{demo.currentNovel}</span>
          </div>
        </div>

        {/* Center: Tabs - Removed */}
        <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button className={cn('p-1.5 rounded-md transition-colors', isLight ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-400')}>
            {isLight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className={cn('p-1.5 rounded-md transition-colors', isLight ? 'hover:bg-zinc-100 text-zinc-600' : 'hover:bg-zinc-800 text-zinc-400')}>
            <Settings className="w-4 h-4" />
          </button>
          <div className={cn('h-4 w-px mx-1', isLight ? 'bg-zinc-200' : 'bg-zinc-800')} />
          <button className={cn('px-3 py-1.5 rounded-md text-xs font-semibold transition-colors shadow-sm', isLight ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200')}>
            {demo.publish}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Visual only) */}
        <div className={cn(
          'w-12 border-r flex flex-col items-center py-4 gap-4 shrink-0',
          isLight ? 'border-zinc-200 bg-zinc-50' : 'border-zinc-800 bg-zinc-900/50',
        )}
        >
          <div className={cn('p-2 rounded-md mb-2', isLight ? 'bg-zinc-200/50' : 'bg-zinc-800/50')}>
            <AlignLeft className="w-4 h-4 opacity-70" />
          </div>
          <Search className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity cursor-pointer" />
          <Share2 className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity cursor-pointer" />
          <div className="flex-1" />
          <Type className="w-4 h-4 opacity-40 hover:opacity-80 transition-opacity cursor-pointer" />
        </div>

        {/* Editor Canvas */}
        <div
          className="flex-1 relative overflow-hidden"
        >
          {/* Toolbar Overlay - Removed */}

          <div
            ref={contentRef}
            className="h-full overflow-y-auto px-8 py-16 scrollbar-hide"
            onScroll={event => onContentScroll(event.currentTarget.scrollTop)}
          >
            <div className="max-w-2xl mx-auto">
              <h1 className="text-4xl font-bold leading-tight mb-8 tracking-tight">{demo.chapterTitle}</h1>

              <div className={cn(
                'space-y-6 text-lg leading-loose font-serif',
                isLight ? 'text-zinc-700' : 'text-zinc-300',
              )}
              >
                <p>{demo.paragraphs[0]}</p>
                <p>
                  <span className={cn('bg-yellow-200/30 dark:bg-yellow-500/20 px-1 rounded', isLight ? 'text-yellow-900' : 'text-yellow-200')}>{demo.highlight}</span>
                  {' '}
                  {demo.paragraphs[1]}
                </p>
                <p>{demo.paragraphs[2]}</p>
                <p>{demo.paragraphs[3]}</p>
                <p>{demo.paragraphs[4]}</p>
                <p>{demo.paragraphs[5]}</p>
                <p>
                  {demo.paragraphs[6]}
                  <span className={cn('inline-block w-0.5 h-5 ml-1 align-middle animate-pulse', isLight ? 'border-zinc-900' : 'border-zinc-100')} />
                </p>
                <p className="opacity-50 blur-[1px]">
                  {demo.paragraphs[7]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={cn(
        'h-8 border-t flex items-center justify-between px-4 text-[10px] font-medium tracking-wide select-none',
        isLight ? 'border-zinc-200 bg-[#ffffff] text-zinc-500' : 'border-zinc-800 bg-[#09090b] text-zinc-400',
      )}
      >
        <div className="flex gap-4">
          <span>Markdown</span>
          <span>UTF-8</span>
        </div>
        <div className="flex gap-4">
          <span>{demo.lineAndColumn}</span>
          <span>{demo.wordCount}</span>
        </div>
      </div>
    </div>
  )
}
