'use client'

import type { MouseEvent, TouchEvent } from 'react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageCompareProps {
  beforeImage: string
  afterImage: string
  beforeLabel?: string
  afterLabel?: string
  className?: string
}

export function ImageCompare({
  beforeImage,
  afterImage,
  beforeLabel = 'Before',
  afterLabel = 'After',
  className,
}: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  const handleMouseDown = () => {
    setIsDragging(true)
    setHasInteracted(true)
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updateSliderPosition(e.clientX)
  }

  const handleTouchStart = () => {
    setIsDragging(true)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return
    updateSliderPosition(e.touches[0].clientX)
  }

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    updateSliderPosition(e.clientX)
    setHasInteracted(true)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full aspect-video overflow-hidden rounded-xl border border-border shadow-xl select-none cursor-col-resize',
        className,
      )}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onClick={handleClick}
    >
      {/* After Image (右侧) */}
      <div className="absolute inset-0">
        <Image
          src={afterImage}
          alt={afterLabel}
          fill
          className="object-cover"
          draggable={false}
          priority
        />
      </div>

      {/* Before Image (左侧) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <Image
          src={beforeImage}
          alt={beforeLabel}
          fill
          className="object-cover"
          draggable={false}
          priority
        />
      </div>

      {/* Before Label - 移到裁剪容器外并提高层级 */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-sm font-medium shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="w-2 h-2 rounded-full bg-orange-500" />
        {beforeLabel}
      </div>

      {/* After Label - 提高层级 */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 dark:bg-white/90 backdrop-blur-sm text-white dark:text-gray-900 text-sm font-medium shadow-lg border border-white/20 dark:border-gray-200">
        <div className="w-2 h-2 rounded-full bg-blue-500" />
        {afterLabel}
      </div>

      {/* Slider Handle */}
      <div
        className="absolute inset-y-0 w-1.5 bg-white dark:bg-gray-100 shadow-lg cursor-col-resize z-10"
        style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle Circle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white dark:bg-gray-100 rounded-full shadow-xl flex items-center justify-center border-4 border-border hover:scale-110 active:scale-95 transition-all duration-200">
          <div className="flex gap-0.5">
            <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-500 rounded-full" />
            <div className="w-0.5 h-4 bg-gray-400 dark:bg-gray-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* Drag Hint */}
      {!hasInteracted && sliderPosition === 50 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/70 backdrop-blur-sm text-white text-sm font-medium animate-pulse pointer-events-none">
          👆 拖动滑块对比
        </div>
      )}
    </div>
  )
}
