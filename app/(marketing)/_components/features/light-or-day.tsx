'use client'

import {
  AlignLeft,
  Bold,
  GripVertical,
  Italic,
  MoreHorizontal,
  PenLine,
  Search,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function LightOrDay() {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const darkScrollRef = useRef<HTMLDivElement>(null)
  const lightScrollRef = useRef<HTMLDivElement>(null)
  const isSyncingScrollRef = useRef(false)

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
    <div className="w-full h-full p-4 bg-card border border-border rounded-lg flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">日夜模式随心切换</h3>
          <p className="text-sm text-muted-foreground mt-1">
            无论白天还是黑夜，都能提供最舒适的创作体验
          </p>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative w-full h-[400px] rounded-lg overflow-hidden border border-border select-none cursor-ew-resize touch-none"
      >
        <div className="absolute inset-0">
          <DemoContent
            theme="dark"
            contentRef={darkScrollRef}
            onContentScroll={scrollTop => handleContentScroll('dark', scrollTop)}
          />
        </div>

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
          />
        </div>

        <div
          className="absolute inset-y-0 w-1 bg-zinc-900/70 z-20 hover:bg-zinc-900 transition-colors"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-zinc-300 rounded-full shadow-lg flex items-center justify-center text-zinc-700">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoContent({
  theme,
  contentRef,
  onContentScroll,
}: {
  theme: 'light' | 'dark'
  contentRef: React.RefObject<HTMLDivElement | null>
  onContentScroll: (scrollTop: number) => void
}) {
  const isLight = theme === 'light'

  return (
    <div className={cn(
      'w-full h-full flex overflow-hidden transition-colors duration-300',
      isLight ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-zinc-50',
    )}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className={cn(
          'h-14 border-b flex items-center justify-between px-6',
          isLight ? 'border-zinc-200' : 'border-zinc-800',
        )}
        >
          <div className={cn('flex items-center gap-4', isLight ? 'text-zinc-500' : 'text-zinc-400')}>
            <span className={cn('text-sm font-medium', isLight ? 'text-zinc-900' : 'text-zinc-100')}>第三章：迷雾重重</span>
            <div className={cn('h-4 w-px', isLight ? 'bg-zinc-200' : 'bg-zinc-700')} />
            <div className="flex gap-1">
              <button className={cn('p-1.5 rounded', isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800')}><Bold className="w-4 h-4" /></button>
              <button className={cn('p-1.5 rounded', isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800')}><Italic className="w-4 h-4" /></button>
              <button className={cn('p-1.5 rounded', isLight ? 'hover:bg-zinc-100' : 'hover:bg-zinc-800')}><AlignLeft className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className={cn('p-2 rounded-full', isLight ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400')}>
              <Search className="w-4 h-4" />
            </button>
            <button className={cn('p-2 rounded-full', isLight ? 'hover:bg-zinc-100 text-zinc-500' : 'hover:bg-zinc-800 text-zinc-400')}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              isLight ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-200',
            )}
            >
              发布
            </button>
          </div>
        </div>

        <div
          ref={contentRef}
          className="flex-1 p-8 overflow-y-auto relative"
          onScroll={event => onContentScroll(event.currentTarget.scrollTop)}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold leading-tight">第三章：迷雾重重</h1>

            <div className={cn(
              'space-y-4 text-lg leading-relaxed',
              isLight ? 'text-zinc-600' : 'text-zinc-300',
            )}
            >
              <p>
                雨水敲打着窗户，发出沉闷的声响。侦探李明坐在昏暗的办公室里，手中的香烟已经燃尽，只剩下一长串摇摇欲坠的烟灰。他盯着桌上的那张照片，眉头紧锁。
              </p>
              <p>
                "这不可能，" 他喃喃自语，"如果他在三点钟离开了现场，那么监控录像里为什么没有他的身影？"
              </p>
              <p>
                窗外的霓虹灯光透过百叶窗的缝隙投射进来，在桌面上切出一道道光影。这座城市就像一个巨大的谜题，每个人都戴着面具，每个人都有秘密。
              </p>
              <p>
                突然，电话铃声刺破了寂静。李明的手颤抖了一下，烟灰终于跌落在陈旧的文件堆上。他深吸一口气，拿起了听筒。
              </p>
              <p>
                "喂？" 他的声音沙哑而疲惫。
              </p>
              <p>
                电话那头是一阵令人不安的沉默，紧接着传来了一个熟悉而又陌生的声音："你离真相太近了，李侦探。"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
