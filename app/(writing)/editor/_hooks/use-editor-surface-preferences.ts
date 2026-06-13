'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_EDITOR_FONT_SIZE,
  getEditorFontSizeStorageKey,
  parseStoredEditorFontSize,
} from '@/lib/editor/font-size-options'
import {
  DEFAULT_EDITOR_SURFACE,
  EDITOR_SURFACE_OPTIONS,
  getEditorSurfaceStorageKey,
  type EditorSurfaceValue,
} from '@/lib/editor/surface-options'
import {
  DEFAULT_EDITOR_TYPOGRAPHY,
  getEditorTypographyStorageKey,
  parseStoredEditorTypography,
  serializeEditorTypography,
  type EditorTypographySettings,
} from '@/lib/editor/typography-options'

export function useEditorSurfacePreferences(novelId: string) {
  const [editorSurface, setEditorSurface] = useState<EditorSurfaceValue>(DEFAULT_EDITOR_SURFACE)
  const [editorFontSize, setEditorFontSize] = useState(DEFAULT_EDITOR_FONT_SIZE)
  const [typography, setTypography] = useState<EditorTypographySettings>(DEFAULT_EDITOR_TYPOGRAPHY)

  useEffect(() => {
    const storedSurface = window.localStorage.getItem(getEditorSurfaceStorageKey(novelId))
    const matchedSurface = EDITOR_SURFACE_OPTIONS.find(option => option.value === storedSurface)
    setEditorSurface(matchedSurface?.value || DEFAULT_EDITOR_SURFACE)
    setEditorFontSize(parseStoredEditorFontSize(window.localStorage.getItem(getEditorFontSizeStorageKey(novelId))))
    setTypography(parseStoredEditorTypography(window.localStorage.getItem(getEditorTypographyStorageKey(novelId))))
  }, [novelId])

  const handleEditorSurfaceChange = useCallback((value: EditorSurfaceValue) => {
    const matched = EDITOR_SURFACE_OPTIONS.find(option => option.value === value)
    if (!matched) return

    setEditorSurface(matched.value)
    window.localStorage.setItem(getEditorSurfaceStorageKey(novelId), matched.value)
  }, [novelId])

  const handleEditorFontSizeChange = useCallback((value: number) => {
    setEditorFontSize(value)
    window.localStorage.setItem(getEditorFontSizeStorageKey(novelId), String(value))
  }, [novelId])

  const handleTypographyChange = useCallback((patch: Partial<EditorTypographySettings>) => {
    setTypography((current) => {
      const next = { ...current, ...patch }
      window.localStorage.setItem(getEditorTypographyStorageKey(novelId), serializeEditorTypography(next))
      return next
    })
  }, [novelId])

  return {
    editorSurface,
    editorFontSize,
    typography,
    handleEditorSurfaceChange,
    handleEditorFontSizeChange,
    handleTypographyChange,
  }
}
