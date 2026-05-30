export const DEFAULT_EDITOR_FONT_SIZE = 17

export const MIN_EDITOR_FONT_SIZE = 14
export const MAX_EDITOR_FONT_SIZE = 24

export const getEditorFontSizeStorageKey = (novelId: string) => `editor-font-size:${novelId}`

export function clampEditorFontSize(value: number) {
  return Math.min(MAX_EDITOR_FONT_SIZE, Math.max(MIN_EDITOR_FONT_SIZE, Math.round(value)))
}

export function parseStoredEditorFontSize(raw: string | null) {
  if (!raw) return DEFAULT_EDITOR_FONT_SIZE

  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed)) return DEFAULT_EDITOR_FONT_SIZE

  return clampEditorFontSize(parsed)
}

export function fontSizeToProgress(fontSize: number) {
  return (clampEditorFontSize(fontSize) - MIN_EDITOR_FONT_SIZE)
    / (MAX_EDITOR_FONT_SIZE - MIN_EDITOR_FONT_SIZE)
}

export function progressToFontSize(progress: number) {
  const clamped = Math.min(1, Math.max(0, progress))
  return clampEditorFontSize(
    MIN_EDITOR_FONT_SIZE + clamped * (MAX_EDITOR_FONT_SIZE - MIN_EDITOR_FONT_SIZE),
  )
}
