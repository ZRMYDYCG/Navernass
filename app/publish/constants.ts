import type { FontFamilyKey, FontSizeKey, LineHeightKey, PublishSettings, ReadingBgKey } from './types'

export const DEFAULT_PUBLISH_SETTINGS: PublishSettings = {
  theme: 'light',
  fontSize: 'medium',
  lineHeight: 'normal',
  fontFamily: 'sans',
  readingBg: 'default',
}

export const FONT_SIZE_OPTIONS: { value: FontSizeKey, i18nKey: string }[] = [
  { value: 'small', i18nKey: 'publish.settings.fontSizeSmall' },
  { value: 'medium', i18nKey: 'publish.settings.fontSizeMedium' },
  { value: 'large', i18nKey: 'publish.settings.fontSizeLarge' },
  { value: 'x-large', i18nKey: 'publish.settings.fontSizeXLarge' },
]

export const LINE_HEIGHT_MAP: Record<LineHeightKey, string> = {
  compact: '1.6',
  normal: '1.8',
  relaxed: '2.0',
  loose: '2.4',
}

export const LINE_HEIGHT_OPTIONS: { value: LineHeightKey, i18nKey: string }[] = [
  { value: 'compact', i18nKey: 'publish.settings.lineHeightCompact' },
  { value: 'normal', i18nKey: 'publish.settings.lineHeightNormal' },
  { value: 'relaxed', i18nKey: 'publish.settings.lineHeightRelaxed' },
  { value: 'loose', i18nKey: 'publish.settings.lineHeightLoose' },
]

export const FONT_FAMILY_MAP: Record<FontFamilyKey, string> = {
  sans: 'var(--font-sans, system-ui, sans-serif)',
  serif: 'Georgia, "Noto Serif SC", "Source Han Serif SC", serif',
}

export const FONT_FAMILY_OPTIONS: { value: FontFamilyKey, i18nKey: string }[] = [
  { value: 'sans', i18nKey: 'publish.settings.fontFamilySans' },
  { value: 'serif', i18nKey: 'publish.settings.fontFamilySerif' },
]

export const READING_BG_MAP: Record<ReadingBgKey, { bg: string, i18nKey: string, preview: string }> = {
  default: { bg: 'transparent', i18nKey: 'publish.settings.bgDefault', preview: 'bg-background' },
  warm: { bg: 'var(--reading-bg-warm)', i18nKey: 'publish.settings.bgWarm', preview: 'bg-(--reading-bg-warm)' },
  green: { bg: 'var(--reading-bg-green)', i18nKey: 'publish.settings.bgGreen', preview: 'bg-(--reading-bg-green)' },
  sepia: { bg: 'var(--reading-bg-sepia)', i18nKey: 'publish.settings.bgSepia', preview: 'bg-(--reading-bg-sepia)' },
}

export const READING_BG_OPTIONS: { value: ReadingBgKey }[] = [
  { value: 'default' },
  { value: 'warm' },
  { value: 'green' },
  { value: 'sepia' },
]
