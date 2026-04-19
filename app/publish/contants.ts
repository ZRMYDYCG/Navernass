import type { FontFamilyKey, FontSizeKey, LineHeightKey, PublishSettings, ReadingBgKey } from './types'

export const DEFAULT_PUBLISH_SETTINGS: PublishSettings = {
  theme: 'light',
  fontSize: 'medium',
  lineHeight: 'normal',
  fontFamily: 'sans',
  readingBg: 'default',
}

export const FONT_SIZE_OPTIONS: { value: FontSizeKey, label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
  { value: 'x-large', label: '特大' },
]

export const LINE_HEIGHT_MAP: Record<LineHeightKey, string> = {
  compact: '1.6',
  normal: '1.8',
  relaxed: '2.0',
  loose: '2.4',
}

export const LINE_HEIGHT_OPTIONS: { value: LineHeightKey, label: string }[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'normal', label: '适中' },
  { value: 'relaxed', label: '宽松' },
  { value: 'loose', label: '舒展' },
]

export const FONT_FAMILY_MAP: Record<FontFamilyKey, string> = {
  sans: 'var(--font-sans, system-ui, sans-serif)',
  serif: 'Georgia, "Noto Serif SC", "Source Han Serif SC", serif',
}

export const FONT_FAMILY_OPTIONS: { value: FontFamilyKey, label: string }[] = [
  { value: 'sans', label: '无衬线' },
  { value: 'serif', label: '衬线' },
]

export const READING_BG_MAP: Record<ReadingBgKey, { bg: string, label: string, preview: string }> = {
  default: { bg: 'transparent', label: '默认', preview: 'bg-background' },
  warm: { bg: '#faf5ee', label: '暖黄', preview: 'bg-[#faf5ee]' },
  green: { bg: '#e8f0e8', label: '护眼', preview: 'bg-[#e8f0e8]' },
  sepia: { bg: '#f0e6d3', label: '羊皮纸', preview: 'bg-[#f0e6d3]' },
}

export const READING_BG_OPTIONS: { value: ReadingBgKey, label: string }[] = [
  { value: 'default', label: '默认' },
  { value: 'warm', label: '暖黄' },
  { value: 'green', label: '护眼' },
  { value: 'sepia', label: '羊皮纸' },
]
