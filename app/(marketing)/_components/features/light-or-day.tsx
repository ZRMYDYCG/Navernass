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
        <div className="absolute inset-0 dark">
          <DemoContent theme="dark" />
        </div>

        <div
          className="absolute inset-0"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <DemoContent theme="light" />
        </div>

        <div
          className="absolute inset-y-0 w-1 bg-primary z-20 hover:bg-primary/80 transition-colors"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-background border border-border rounded-full shadow-lg flex items-center justify-center text-foreground">
            <GripVertical className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

function DemoContent({ theme }: { theme: 'light' | 'dark' }) {
  return (
    <div className={cn(
      'w-full h-full bg-background text-foreground flex overflow-hidden transition-colors duration-300',
      theme === 'light' ? 'bg-white text-zinc-950' : 'bg-zinc-950 text-zinc-50',
    )}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="text-sm font-medium text-foreground">第三章：迷雾重重</span>
            <div className="h-4 w-px bg-border" />
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-accent rounded"><Bold className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-accent rounded"><Italic className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-accent rounded"><AlignLeft className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground">
              <Search className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              theme === 'light' ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-200',
            )}
            >
              发布
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto relative">
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold leading-tight">第三章：迷雾重重</h1>

            <div className="space-y-4 text-lg leading-relaxed text-muted-foreground">
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

          <div className="absolute bottom-8 right-8">
            <button className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
              <PenLine className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
