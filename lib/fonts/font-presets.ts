export const FONT_PRESET_IDS = [
  'classic',
  'modern',
  'literary',
  'paper',
  'elegant',
  'ink',
  'wenkai',
  'handwriting',
] as const

export type FontPresetId = (typeof FONT_PRESET_IDS)[number]

export const DEFAULT_FONT_PRESET: FontPresetId = 'classic'

export interface FontPresetStacks {
  sans: string
  serif: string
  editor: string
  display: string
  handwriting: string
  /** Inline style for settings preview chip */
  preview: string
}

export interface FontPreset {
  id: FontPresetId
  labelKey: `settings.fontPresets.${FontPresetId}`
  noteKey: `settings.fontPresetNotes.${FontPresetId}`
  stacks: FontPresetStacks
}

const FALLBACK_SANS = 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"'
const FALLBACK_SERIF = 'Georgia, "Times New Roman", serif'
const FALLBACK_HANDWRITING = 'cursive'

const nextSans = `var(--font-sans), ${FALLBACK_SANS}`
const nextSerif = `var(--font-serif), var(--font-serif-sc), ${FALLBACK_SERIF}`
const nextHandwriting = `var(--font-handwriting), ${FALLBACK_HANDWRITING}`

export const FONT_PRESETS: Record<FontPresetId, FontPreset> = {
  classic: {
    id: 'classic',
    labelKey: 'settings.fontPresets.classic',
    noteKey: 'settings.fontPresetNotes.classic',
    stacks: {
      sans: nextSans,
      serif: nextSerif,
      editor: nextSerif,
      display: nextSerif,
      handwriting: nextHandwriting,
      preview: nextSerif,
    },
  },
  modern: {
    id: 'modern',
    labelKey: 'settings.fontPresets.modern',
    noteKey: 'settings.fontPresetNotes.modern',
    stacks: {
      sans: `var(--font-sans), var(--font-sans-sc), ${FALLBACK_SANS}`,
      serif: `var(--font-sans), var(--font-sans-sc), ${FALLBACK_SANS}`,
      editor: `var(--font-sans), var(--font-sans-sc), ${FALLBACK_SANS}`,
      display: `var(--font-sans), var(--font-sans-sc), ${FALLBACK_SANS}`,
      handwriting: nextHandwriting,
      preview: `var(--font-sans), var(--font-sans-sc), ${FALLBACK_SANS}`,
    },
  },
  literary: {
    id: 'literary',
    labelKey: 'settings.fontPresets.literary',
    noteKey: 'settings.fontPresetNotes.literary',
    stacks: {
      sans: `'Literata', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      serif: `'Literata', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      editor: `'Literata', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      display: `'Literata', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      handwriting: nextHandwriting,
      preview: `'Literata', var(--font-serif-sc), ${FALLBACK_SERIF}`,
    },
  },
  paper: {
    id: 'paper',
    labelKey: 'settings.fontPresets.paper',
    noteKey: 'settings.fontPresetNotes.paper',
    stacks: {
      sans: `'Source Serif 4', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      serif: `'Source Serif 4', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      editor: `'Source Serif 4', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      display: `'Source Serif 4', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      handwriting: nextHandwriting,
      preview: `'Source Serif 4', var(--font-serif-sc), ${FALLBACK_SERIF}`,
    },
  },
  elegant: {
    id: 'elegant',
    labelKey: 'settings.fontPresets.elegant',
    noteKey: 'settings.fontPresetNotes.elegant',
    stacks: {
      sans: `'Crimson Pro', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      serif: `'Crimson Pro', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      editor: `'Crimson Pro', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      display: `'Crimson Pro', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      handwriting: nextHandwriting,
      preview: `'Crimson Pro', var(--font-serif-sc), ${FALLBACK_SERIF}`,
    },
  },
  ink: {
    id: 'ink',
    labelKey: 'settings.fontPresets.ink',
    noteKey: 'settings.fontPresetNotes.ink',
    stacks: {
      sans: `'Merriweather', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      serif: `'Merriweather', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      editor: `'Merriweather', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      display: `'Merriweather', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      handwriting: nextHandwriting,
      preview: `'Merriweather', var(--font-serif-sc), ${FALLBACK_SERIF}`,
    },
  },
  wenkai: {
    id: 'wenkai',
    labelKey: 'settings.fontPresets.wenkai',
    noteKey: 'settings.fontPresetNotes.wenkai',
    stacks: {
      sans: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      serif: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      editor: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      display: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      handwriting: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
      preview: `'LXGW WenKai', var(--font-serif-sc), ${FALLBACK_SERIF}`,
    },
  },
  handwriting: {
    id: 'handwriting',
    labelKey: 'settings.fontPresets.handwriting',
    noteKey: 'settings.fontPresetNotes.handwriting',
    stacks: {
      sans: `var(--font-handwriting), 'Ma Shan Zheng', var(--font-serif-sc), ${FALLBACK_HANDWRITING}`,
      serif: `var(--font-handwriting), 'Ma Shan Zheng', var(--font-serif-sc), ${FALLBACK_HANDWRITING}`,
      editor: `var(--font-handwriting), 'Ma Shan Zheng', var(--font-serif-sc), ${FALLBACK_HANDWRITING}`,
      display: `'Ma Shan Zheng', var(--font-handwriting), var(--font-serif-sc), ${FALLBACK_HANDWRITING}`,
      handwriting: `var(--font-handwriting), 'Ma Shan Zheng', ${FALLBACK_HANDWRITING}`,
      preview: `'Ma Shan Zheng', var(--font-handwriting), ${FALLBACK_HANDWRITING}`,
    },
  },
}

export const FONT_PRESET_LIST = FONT_PRESET_IDS.map(id => FONT_PRESETS[id])

export function isFontPresetId(value: string): value is FontPresetId {
  return FONT_PRESET_IDS.includes(value as FontPresetId)
}

export function applyFontPresetToRoot(root: HTMLElement, presetId: FontPresetId) {
  const preset = FONT_PRESETS[presetId]
  root.setAttribute('data-font-preset', presetId)
  root.style.setProperty('--app-font-sans', preset.stacks.sans)
  root.style.setProperty('--app-font-serif', preset.stacks.serif)
  root.style.setProperty('--app-font-editor', preset.stacks.editor)
  root.style.setProperty('--app-font-display', preset.stacks.display)
  root.style.setProperty('--app-font-handwriting', preset.stacks.handwriting)
}
