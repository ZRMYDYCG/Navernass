'use client'

import { createContext, useEffect, useMemo, useState } from 'react'
import {
  applyFontPresetToRoot,
  DEFAULT_FONT_PRESET,
  isFontPresetId,
  type FontPresetId,
} from '@/lib/fonts/font-presets'

// eslint-disable-next-line react-refresh/only-export-components
export const FontContext = createContext<{
  fontPreset: FontPresetId
  setFontPreset: (preset: FontPresetId) => void
  isFontLoading: boolean
}>({
  fontPreset: DEFAULT_FONT_PRESET,
  setFontPreset: () => null,
  isFontLoading: false,
})

export function FontProvider({
  children,
  defaultPreset = DEFAULT_FONT_PRESET,
  storageKey = 'font-preset',
}: {
  children: React.ReactNode
  defaultPreset?: FontPresetId
  storageKey?: string
}) {
  const [fontPreset, setFontPresetState] = useState<FontPresetId>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey)
      if (stored && isFontPresetId(stored)) return stored
    }
    return defaultPreset
  })
  const [isFontLoading, setIsFontLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    applyFontPresetToRoot(window.document.documentElement, fontPreset)
    localStorage.setItem(storageKey, fontPreset)

    const load = async () => {
      setIsFontLoading(true)
      try {
        const { loadFontPreset } = await import('@/lib/fonts/load-font-preset')
        await loadFontPreset(fontPreset)
      } finally {
        if (!cancelled) setIsFontLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [fontPreset, storageKey])

  const setFontPreset = (preset: FontPresetId) => {
    setFontPresetState(preset)
  }

  const value = useMemo(
    () => ({
      fontPreset,
      setFontPreset,
      isFontLoading,
    }),
    [fontPreset, isFontLoading],
  )

  return (
    <FontContext value={value}>
      {children}
    </FontContext>
  )
}
