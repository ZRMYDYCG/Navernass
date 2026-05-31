'use client'

import type { RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { shouldUseNativeCursor } from '@/lib/editor/cursor-context'
import {
  EDITOR_CURSOR_SIZE,
  getEditorCursorHotspot,
  getEditorCursorImageSrc,
  isCustomEditorCursor,
  type EditorCursorValue,
} from '@/lib/editor/cursor-options'

interface EditorCursorOverlayProps {
  cursor: EditorCursorValue
  containerRef: RefObject<HTMLElement | null>
  disabled?: boolean
}

interface OverlayState {
  x: number
  y: number
}

const CURSOR_ACTIVE_CLASS = 'editor-custom-cursor-active'

function setNativeCursorHidden(hidden: boolean) {
  const root = document.documentElement
  const { body } = document

  if (hidden) {
    root.style.setProperty('cursor', 'none', 'important')
    body.style.setProperty('cursor', 'none', 'important')
    return
  }

  root.style.removeProperty('cursor')
  body.style.removeProperty('cursor')
}

function setContainerCustomCursor(container: HTMLElement | null, enabled: boolean) {
  if (!container) return

  if (enabled) {
    container.classList.add(CURSOR_ACTIVE_CLASS)
    return
  }

  container.classList.remove(CURSOR_ACTIVE_CLASS)
}

export function EditorCursorOverlay({
  cursor,
  containerRef,
  disabled = false,
}: EditorCursorOverlayProps) {
  const [overlay, setOverlay] = useState<OverlayState | null>(null)
  const frameRef = useRef<number | null>(null)
  const active = !disabled && isCustomEditorCursor(cursor)
  const imageSrc = getEditorCursorImageSrc(cursor)
  const [hotspotX, hotspotY] = getEditorCursorHotspot(cursor)

  useEffect(() => {
    const container = containerRef.current

    if (!active) {
      setOverlay(null)
      setContainerCustomCursor(container, false)
      setNativeCursorHidden(false)
      return
    }

    if (!container) {
      return () => {
        setNativeCursorHidden(false)
      }
    }

    const applyCursorMode = (event: PointerEvent) => {
      const useNative = shouldUseNativeCursor(event, container)

      if (useNative) {
        setContainerCustomCursor(container, false)
        setNativeCursorHidden(false)
        setOverlay(null)
        return
      }

      setContainerCustomCursor(container, true)
      setNativeCursorHidden(true)
      setOverlay({ x: event.clientX, y: event.clientY })
    }

    const scheduleUpdate = (event: PointerEvent) => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null
        applyCursorMode(event)
      })
    }

    const handlePointerLeave = () => {
      setContainerCustomCursor(container, false)
      setNativeCursorHidden(false)
      setOverlay(null)
    }

    container.addEventListener('pointermove', scheduleUpdate, { passive: true })
    container.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      container.removeEventListener('pointermove', scheduleUpdate)
      container.removeEventListener('pointerleave', handlePointerLeave)
      setContainerCustomCursor(container, false)
      setNativeCursorHidden(false)

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
  }, [active, containerRef])

  if (!active || !imageSrc || !overlay) {
    return null
  }

  return (
    <div
      aria-hidden
      className="editor-cursor-overlay pointer-events-none fixed left-0 top-0 z-[9999] will-change-transform"
      style={{
        transform: `translate3d(${overlay.x - hotspotX}px, ${overlay.y - hotspotY}px, 0)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageSrc}
        alt=""
        width={EDITOR_CURSOR_SIZE}
        height={EDITOR_CURSOR_SIZE}
        draggable={false}
        className="pointer-events-none select-none"
      />
    </div>
  )
}
