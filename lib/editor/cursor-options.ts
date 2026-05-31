import type { CSSProperties } from 'react'

export const DEFAULT_EDITOR_CURSOR = 'default'

export const EDITOR_CURSOR_STORAGE_KEY = 'editor-cursor'

const CURSOR_SVGS = {
  feather: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M5 27C5 27 7.5 19 13.5 12.5C17.5 8.5 23.5 4.5 26.5 4C26.5 4 22.5 9.5 18.5 15.5C14.5 21.5 5 27 5 27Z" fill="#2A2622" stroke="#F4EFE6" stroke-width="1.1"/><path d="M5 27L3 29.5" stroke="#2A2622" stroke-width="1.6" stroke-linecap="round"/><path d="M10 18.5C12 16.5 15 13.5 18 10.5" stroke="#F4EFE6" stroke-width="0.8" stroke-linecap="round" opacity="0.7"/></svg>',
  ink: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M8 24C8 24 10 18 14 14C17 11 22 8 24 8C24 8 20 13 17 17C14 21 8 24 8 24Z" fill="#1F1B18" stroke="#EDE8DF" stroke-width="1"/><ellipse cx="7" cy="25.5" rx="2.8" ry="2.2" fill="#1F1B18" stroke="#EDE8DF" stroke-width="0.9"/><path d="M12 17C13.5 15.5 16 13 18.5 11" stroke="#EDE8DF" stroke-width="0.7" stroke-linecap="round" opacity="0.65"/></svg>',
  brush: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M4 28L8 24L18 14L22 18L12 28L4 28Z" fill="#3D3832" stroke="#F0EBE2" stroke-width="1"/><path d="M18 14L24 8L27 11L21 17L18 14Z" fill="#6B4E3D" stroke="#F0EBE2" stroke-width="0.9"/><path d="M24 8L26.5 5.5L28.5 7.5L26 10L24 8Z" fill="#8B6914" stroke="#F0EBE2" stroke-width="0.8"/></svg>',
  star: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M16 4L18.2 12.8L27 12.8L19.9 18.2L22.1 27L16 21.6L9.9 27L12.1 18.2L5 12.8L13.8 12.8L16 4Z" fill="#2E2A24" stroke="#F3EEE5" stroke-width="1" stroke-linejoin="round"/><circle cx="16" cy="16" r="1.2" fill="#F3EEE5"/></svg>',
  moon: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M20.5 6.5C16.5 6.5 13 10 13 14.5C13 19 16.5 22.5 20.5 22.5C18.5 22.5 17 21 17 19C17 17 18.5 15.5 20.5 15.5C19 12.5 19.5 9 20.5 6.5Z" fill="#2A2730" stroke="#EEE9F2" stroke-width="1"/><circle cx="22" cy="9" r="0.8" fill="#EEE9F2" opacity="0.8"/><circle cx="24" cy="13" r="0.5" fill="#EEE9F2" opacity="0.55"/></svg>',
  leaf: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M6 25C6 25 8 16 14 11C18 7.5 24 6 26 6C26 6 23 12 19 17C15 22 6 25 6 25Z" fill="#2F4A35" stroke="#E8F0EA" stroke-width="1"/><path d="M6 25C10 21 15 16 20 11" stroke="#E8F0EA" stroke-width="0.8" stroke-linecap="round" opacity="0.75"/><path d="M6 25L4.5 27" stroke="#2F4A35" stroke-width="1.4" stroke-linecap="round"/></svg>',
  dot: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="5.5" fill="#2C2824" stroke="#F2EDE4" stroke-width="1.2"/><circle cx="16" cy="16" r="1.5" fill="#F2EDE4" opacity="0.85"/></svg>',
} as const

export type CustomEditorCursorValue = keyof typeof CURSOR_SVGS

export const EDITOR_CURSOR_OPTIONS = [
  { value: 'default', path: null, hotspot: [0, 0] as const },
  { value: 'feather', path: '/cursors/feather.svg', hotspot: [4, 28] as const },
  { value: 'ink', path: '/cursors/ink.svg', hotspot: [5, 24] as const },
  { value: 'brush', path: '/cursors/brush.svg', hotspot: [3, 26] as const },
  { value: 'star', path: '/cursors/star.svg', hotspot: [16, 16] as const },
  { value: 'moon', path: '/cursors/moon.svg', hotspot: [18, 10] as const },
  { value: 'leaf', path: '/cursors/leaf.svg', hotspot: [6, 24] as const },
  { value: 'dot', path: '/cursors/dot.svg', hotspot: [16, 16] as const },
] as const

export type EditorCursorValue = (typeof EDITOR_CURSOR_OPTIONS)[number]['value']

export const EDITOR_CURSOR_SIZE = 32

export function resolveEditorCursor(value: string | null | undefined): EditorCursorValue {
  const matched = EDITOR_CURSOR_OPTIONS.find(option => option.value === value)
  return matched?.value ?? DEFAULT_EDITOR_CURSOR
}

export function isCustomEditorCursor(value: EditorCursorValue): value is CustomEditorCursorValue {
  return value !== 'default'
}

export function getEditorCursorOption(value: EditorCursorValue) {
  return EDITOR_CURSOR_OPTIONS.find(option => option.value === value) ?? EDITOR_CURSOR_OPTIONS[0]
}

export function getEditorCursorImageSrc(value: EditorCursorValue): string | null {
  if (!isCustomEditorCursor(value)) return null

  const svg = CURSOR_SVGS[value]
  return svg ? `data:image/svg+xml,${encodeURIComponent(svg)}` : null
}

export function getEditorCursorHotspot(value: EditorCursorValue): readonly [number, number] {
  return getEditorCursorOption(value).hotspot
}

export function readStoredEditorCursor(): EditorCursorValue {
  if (typeof window === 'undefined') return DEFAULT_EDITOR_CURSOR
  return resolveEditorCursor(window.localStorage.getItem(EDITOR_CURSOR_STORAGE_KEY))
}

export function persistEditorCursor(value: EditorCursorValue) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(EDITOR_CURSOR_STORAGE_KEY, value)
}

/** @deprecated CSS url() cursors are unreliable on Windows; overlay is used instead */
export function getEditorCursorStyle(_value: EditorCursorValue): CSSProperties | undefined {
  return undefined
}
