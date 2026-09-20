'use client'

import type { FontPresetId } from './font-presets'

const loadedPresets = new Set<FontPresetId>()

async function loadLiterata() {
  await Promise.all([
    import('@fontsource/literata/latin-400.css'),
    import('@fontsource/literata/latin-500.css'),
    import('@fontsource/literata/latin-600.css'),
    import('@fontsource/literata/latin-700.css'),
    import('@fontsource/literata/latin-400-italic.css'),
  ])
}

async function loadSourceSerif4() {
  await Promise.all([
    import('@fontsource/source-serif-4/latin-400.css'),
    import('@fontsource/source-serif-4/latin-500.css'),
    import('@fontsource/source-serif-4/latin-600.css'),
    import('@fontsource/source-serif-4/latin-700.css'),
    import('@fontsource/source-serif-4/latin-400-italic.css'),
  ])
}

async function loadCrimsonPro() {
  await Promise.all([
    import('@fontsource/crimson-pro/latin-400.css'),
    import('@fontsource/crimson-pro/latin-500.css'),
    import('@fontsource/crimson-pro/latin-600.css'),
    import('@fontsource/crimson-pro/latin-700.css'),
    import('@fontsource/crimson-pro/latin-400-italic.css'),
  ])
}

async function loadMerriweather() {
  await Promise.all([
    import('@fontsource/merriweather/latin-400.css'),
    import('@fontsource/merriweather/latin-700.css'),
    import('@fontsource/merriweather/latin-400-italic.css'),
  ])
}

async function loadWenkai() {
  await import('lxgw-wenkai-webfont/style.css')
}

async function loadHandwriting() {
  await import('@fontsource/ma-shan-zheng/chinese-simplified-400.css')
}

async function loadModernSansSc() {
  await Promise.all([
    import('@fontsource/noto-sans-sc/chinese-simplified-400.css'),
    import('@fontsource/noto-sans-sc/chinese-simplified-500.css'),
    import('@fontsource/noto-sans-sc/chinese-simplified-700.css'),
  ])
}

export async function loadFontPreset(presetId: FontPresetId) {
  if (typeof window === 'undefined') return
  if (loadedPresets.has(presetId)) return

  switch (presetId) {
    case 'literary':
      await loadLiterata()
      break
    case 'paper':
      await loadSourceSerif4()
      break
    case 'elegant':
      await loadCrimsonPro()
      break
    case 'ink':
      await loadMerriweather()
      break
    case 'wenkai':
      await loadWenkai()
      break
    case 'handwriting':
      await loadHandwriting()
      break
    case 'modern':
      await loadModernSansSc()
      break
    case 'classic':
      break
  }

  loadedPresets.add(presetId)
}
