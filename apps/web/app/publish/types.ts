export type FontSizeKey = 'small' | 'medium' | 'large' | 'x-large'
export type LineHeightKey = 'compact' | 'normal' | 'relaxed' | 'loose'
export type FontFamilyKey = 'sans' | 'serif'
export type ReadingBgKey = 'default' | 'warm' | 'green' | 'sepia'

export interface PublishSettings {
  theme: 'light' | 'dark'
  fontSize: FontSizeKey
  lineHeight: LineHeightKey
  fontFamily: FontFamilyKey
  readingBg: ReadingBgKey
}

export interface PublishedChapter {
  id: string
  novel_id: string
  volume_id?: string
  title: string
  content: string
  order_index: number
  word_count: number
  created_at: string
  updated_at: string
}

export interface PublishedVolume {
  id: string
  novel_id: string
  title: string
  description?: string
  order_index: number
}

export interface PublishedNovel {
  id: string
  title: string
  description?: string
  cover?: string
  volumes: PublishedVolume[]
  chapters: PublishedChapter[]
}

export const FONT_SIZE_MAP: Record<FontSizeKey, string> = {
  'small': '16px',
  'medium': '18px',
  'large': '20px',
  'x-large': '22px',
} as const
