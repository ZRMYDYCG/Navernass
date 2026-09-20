'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import { EDITOR_SURFACE_OPTIONS, type EditorSurfaceValue } from '@/lib/editor/surface-options'
import {
  EDITOR_COLUMN_WIDTH_MAP,
  EDITOR_LINE_HEIGHT_MAP,
  type EditorTypographySettings,
} from '@/lib/editor/typography-options'
import { cn } from '@/lib/utils'

import { EditorSurfaceFontSizeControl } from './editor-surface-font-size-control'

interface EditorSurfaceScrollAreaProps {
  editorSurface: EditorSurfaceValue
  fontSize: number
  typography: EditorTypographySettings
  onFontSizeChange: (fontSize: number) => void
  className?: string
  children: ReactNode
}

export function EditorSurfaceScrollArea({
  editorSurface,
  fontSize,
  typography,
  onFontSizeChange,
  className,
  children,
}: EditorSurfaceScrollAreaProps) {
  const { t } = useI18n()
  const scrollRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [scrollable, setScrollable] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentEditorSurface = useMemo(
    () => EDITOR_SURFACE_OPTIONS.find(option => option.value === editorSurface) || EDITOR_SURFACE_OPTIONS[0],
    [editorSurface],
  )

  const scrollClassName = cn(
    'h-full min-h-0 overflow-y-auto transition-colors [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
    currentEditorSurface.textured && 'bg-paper-texture',
  )

  const updateScrollMetrics = useCallback(() => {
    const element = scrollRef.current
    if (!element) return

    const { scrollTop, scrollHeight, clientHeight } = element
    const maxScroll = scrollHeight - clientHeight
    const canScroll = maxScroll > 1

    setScrollable(canScroll)

    if (!isDraggingRef.current) {
      setProgress(canScroll ? scrollTop / maxScroll : 0)
    }
  }, [])

  const scrollToProgress = useCallback((ratio: number) => {
    const element = scrollRef.current
    if (!element) return

    const clamped = Math.min(1, Math.max(0, ratio))
    const maxScroll = element.scrollHeight - element.clientHeight

    element.scrollTop = clamped * maxScroll
    setProgress(clamped)
  }, [])

  const getProgressFromClientY = useCallback((clientY: number) => {
    const track = trackRef.current
    if (!track) return 0

    const rect = track.getBoundingClientRect()
    if (rect.height <= 0) return 0

    return Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
  }, [])

  const handleScroll = useCallback(() => {
    updateScrollMetrics()
    setIsScrolling(true)

    if (scrollIdleTimerRef.current) {
      clearTimeout(scrollIdleTimerRef.current)
    }

    scrollIdleTimerRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1200)
  }, [updateScrollMetrics])

  const handleTrackPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollable) return

    event.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    scrollToProgress(getProgressFromClientY(event.clientY))
  }, [getProgressFromClientY, scrollToProgress, scrollable])

  const handleTrackPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    scrollToProgress(getProgressFromClientY(event.clientY))
  }, [getProgressFromClientY, scrollToProgress])

  const handleTrackPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  useEffect(() => {
    const element = scrollRef.current
    if (!element) return

    updateScrollMetrics()

    const resizeObserver = new ResizeObserver(() => {
      updateScrollMetrics()
    })

    resizeObserver.observe(element)

    const content = element.querySelector('.editor-surface-scroll-content')
    if (content) {
      resizeObserver.observe(content)
    }

    window.addEventListener('resize', updateScrollMetrics)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScrollMetrics)

      if (scrollIdleTimerRef.current) {
        clearTimeout(scrollIdleTimerRef.current)
      }
    }
  }, [updateScrollMetrics])

  const progressPercent = Math.round(progress * 100)

  return (
    <div
      data-editor-surface={editorSurface}
      data-first-line-indent={typography.firstLineIndent ? 'true' : 'false'}
      data-underline-paper={typography.underlinePaper ? 'true' : 'false'}
      data-prose-focus={typography.proseFocus ? 'true' : 'false'}
      className={cn('relative min-h-0', className)}
      style={{
        '--editor-surface-font-size': `${fontSize}px`,
        '--editor-surface-line-height': EDITOR_LINE_HEIGHT_MAP[typography.lineHeight],
        '--editor-surface-max-width': EDITOR_COLUMN_WIDTH_MAP[typography.columnWidth],
      } as React.CSSProperties}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={scrollClassName}
      >
        <div className="editor-surface-scroll-content min-h-0">
          {children}
        </div>
      </div>

      {scrollable && (
        <div
          ref={trackRef}
          role="slider"
          aria-label={t('editor.surface.scrollProgress')}
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercent}
          aria-valuetext={`${progressPercent}%`}
          tabIndex={0}
          onKeyDown={(event) => {
            const step = event.shiftKey ? 0.1 : 0.05
            if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
              event.preventDefault()
              scrollToProgress(progress + step)
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
              event.preventDefault()
              scrollToProgress(progress - step)
            } else if (event.key === 'Home') {
              event.preventDefault()
              scrollToProgress(0)
            } else if (event.key === 'End') {
              event.preventDefault()
              scrollToProgress(1)
            }
          }}
          onPointerDown={handleTrackPointerDown}
          onPointerMove={handleTrackPointerMove}
          onPointerUp={handleTrackPointerUp}
          onPointerCancel={handleTrackPointerUp}
          className={cn(
            'editor-surface-scroll-progress group pointer-events-auto absolute right-2 top-1/2 z-20 flex h-[min(9rem,32%)] w-3 -translate-y-1/2 cursor-pointer touch-none items-center justify-center transition-opacity duration-300',
            isScrolling || isDragging ? 'opacity-100' : 'opacity-45 hover:opacity-75',
          )}
        >
          <div className="editor-surface-scroll-progress-track relative h-full w-0.5 overflow-visible rounded-full">
            <div
              className={cn(
                'editor-surface-scroll-progress-fill absolute inset-x-0 top-0 rounded-full',
                isDragging ? 'transition-none' : 'transition-[height] duration-100 ease-out',
              )}
              style={{ height: `${progressPercent}%` }}
            />
            <div
              className={cn(
                'editor-surface-scroll-progress-thumb pointer-events-none absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full',
                isDragging ? 'scale-110' : 'scale-100',
                isScrolling || isDragging ? 'opacity-100' : 'opacity-90',
              )}
              style={{ top: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <EditorSurfaceFontSizeControl
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
      />
    </div>
  )
}
