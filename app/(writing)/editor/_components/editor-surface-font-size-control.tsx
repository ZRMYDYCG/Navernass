'use client'

import { useCallback, useRef, useState } from 'react'
import { useI18n } from '@/hooks/use-i18n'
import {
  fontSizeToProgress,
  MAX_EDITOR_FONT_SIZE,
  MIN_EDITOR_FONT_SIZE,
  progressToFontSize,
} from '@/lib/editor/font-size-options'
import { cn } from '@/lib/utils'

interface EditorSurfaceFontSizeControlProps {
  fontSize: number
  onFontSizeChange: (fontSize: number) => void
}

export function EditorSurfaceFontSizeControl({
  fontSize,
  onFontSizeChange,
}: EditorSurfaceFontSizeControlProps) {
  const { t } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  const progress = fontSizeToProgress(fontSize)
  const progressPercent = Math.round(progress * 100)

  const getProgressFromClientX = useCallback((clientX: number) => {
    const track = trackRef.current
    if (!track) return progress

    const rect = track.getBoundingClientRect()
    if (rect.width <= 0) return progress

    return Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
  }, [progress])

  const applyProgress = useCallback((value: number) => {
    onFontSizeChange(progressToFontSize(value))
  }, [onFontSizeChange])

  const handleTrackPointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    isDraggingRef.current = true
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
    applyProgress(getProgressFromClientX(event.clientX))
  }, [applyProgress, getProgressFromClientX])

  const handleTrackPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    applyProgress(getProgressFromClientX(event.clientX))
  }, [applyProgress, getProgressFromClientX])

  const handleTrackPointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    isDraggingRef.current = false
    setIsDragging(false)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  return (
    <div className="editor-surface-font-size pointer-events-auto absolute bottom-3 left-3 z-20 flex items-center gap-2 opacity-55 transition-opacity duration-300 hover:opacity-90">
      <span
        className="editor-surface-font-size-label editor-surface-font-size-label-sm select-none text-[10px] leading-none"
        aria-hidden
      >
        A
      </span>

      <div
        ref={trackRef}
        role="slider"
        aria-label={t('editor.surface.fontSizeControl')}
        aria-valuemin={MIN_EDITOR_FONT_SIZE}
        aria-valuemax={MAX_EDITOR_FONT_SIZE}
        aria-valuenow={fontSize}
        aria-valuetext={`${fontSize}px`}
        tabIndex={0}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 2 : 1
          if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault()
            onFontSizeChange(Math.min(MAX_EDITOR_FONT_SIZE, fontSize + step))
          } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault()
            onFontSizeChange(Math.max(MIN_EDITOR_FONT_SIZE, fontSize - step))
          } else if (event.key === 'Home') {
            event.preventDefault()
            onFontSizeChange(MIN_EDITOR_FONT_SIZE)
          } else if (event.key === 'End') {
            event.preventDefault()
            onFontSizeChange(MAX_EDITOR_FONT_SIZE)
          }
        }}
        onPointerDown={handleTrackPointerDown}
        onPointerMove={handleTrackPointerMove}
        onPointerUp={handleTrackPointerUp}
        onPointerCancel={handleTrackPointerUp}
        className="group flex h-3 w-24 cursor-pointer touch-none items-center"
      >
        <div className="editor-surface-font-size-track relative h-0.5 w-full overflow-visible rounded-full">
          <div
            className={cn(
              'editor-surface-font-size-fill absolute inset-y-0 left-0 rounded-full',
              isDragging ? 'transition-none' : 'transition-[width] duration-100 ease-out',
            )}
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className={cn(
              'editor-surface-font-size-thumb pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-90',
              isDragging && 'scale-110',
            )}
            style={{ left: `${progressPercent}%` }}
          />
        </div>
      </div>

      <span
        className="editor-surface-font-size-label editor-surface-font-size-value min-w-7 select-none text-[10px] leading-none tabular-nums"
      >
        {fontSize}
      </span>
    </div>
  )
}
