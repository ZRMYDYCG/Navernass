export interface PublishSettings {
  theme: 'light' | 'dark'
  fontSize: 'small' | 'medium' | 'large' | 'x-large'
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

export interface PublishedNovel {
  id: string
  title: string
  description?: string
  cover?: string
  chapters: PublishedChapter[]
}

export const FONT_SIZE_MAP = {
  small: '16px',
  medium: '18px',
  large: '20px',
  'x-large': '22px',
} as const
