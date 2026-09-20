export type EditorLineHeightKey = 'compact' | 'normal' | 'relaxed' | 'loose'
export type EditorColumnWidthKey = 'narrow' | 'default' | 'wide'

export interface EditorTypographySettings {
  firstLineIndent: boolean
  lineHeight: EditorLineHeightKey
  underlinePaper: boolean
  proseFocus: boolean
  columnWidth: EditorColumnWidthKey
}

export const DEFAULT_EDITOR_TYPOGRAPHY: EditorTypographySettings = {
  firstLineIndent: true,
  lineHeight: 'normal',
  underlinePaper: false,
  proseFocus: false,
  columnWidth: 'default',
}

export const EDITOR_COLUMN_WIDTH_MAP: Record<EditorColumnWidthKey, string> = {
  narrow: '36rem',
  default: '42rem',
  wide: '48rem',
}

export const EDITOR_LINE_HEIGHT_MAP: Record<EditorLineHeightKey, string> = {
  compact: '1.6',
  normal: '1.8',
  relaxed: '2.0',
  loose: '2.4',
}

export const EDITOR_LINE_HEIGHT_OPTIONS: { value: EditorLineHeightKey, i18nKey: string }[] = [
  { value: 'compact', i18nKey: 'publish.settings.lineHeightCompact' },
  { value: 'normal', i18nKey: 'publish.settings.lineHeightNormal' },
  { value: 'relaxed', i18nKey: 'publish.settings.lineHeightRelaxed' },
  { value: 'loose', i18nKey: 'publish.settings.lineHeightLoose' },
]

export const EDITOR_COLUMN_WIDTH_OPTIONS: { value: EditorColumnWidthKey, i18nKey: string }[] = [
  { value: 'narrow', i18nKey: 'editor.typography.columnWidthNarrow' },
  { value: 'default', i18nKey: 'editor.typography.columnWidthDefault' },
  { value: 'wide', i18nKey: 'editor.typography.columnWidthWide' },
]

export const getEditorTypographyStorageKey = (novelId: string) => `editor-typography:${novelId}`

export function parseStoredEditorTypography(raw: string | null): EditorTypographySettings {
  if (!raw) return DEFAULT_EDITOR_TYPOGRAPHY

  try {
    const parsed = JSON.parse(raw) as Partial<EditorTypographySettings>
    const lineHeight = EDITOR_LINE_HEIGHT_OPTIONS.some(o => o.value === parsed.lineHeight)
      ? parsed.lineHeight!
      : DEFAULT_EDITOR_TYPOGRAPHY.lineHeight
    const columnWidth = EDITOR_COLUMN_WIDTH_OPTIONS.some(o => o.value === parsed.columnWidth)
      ? parsed.columnWidth!
      : DEFAULT_EDITOR_TYPOGRAPHY.columnWidth

    return {
      firstLineIndent: parsed.firstLineIndent ?? DEFAULT_EDITOR_TYPOGRAPHY.firstLineIndent,
      lineHeight,
      underlinePaper: parsed.underlinePaper ?? DEFAULT_EDITOR_TYPOGRAPHY.underlinePaper,
      proseFocus: parsed.proseFocus ?? DEFAULT_EDITOR_TYPOGRAPHY.proseFocus,
      columnWidth,
    }
  } catch {
    return DEFAULT_EDITOR_TYPOGRAPHY
  }
}

export function serializeEditorTypography(settings: EditorTypographySettings) {
  return JSON.stringify(settings)
}
