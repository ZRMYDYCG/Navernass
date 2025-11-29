import type { Novel } from '@/lib/supabase/sdk'

export type ViewMode = 'grid' | 'table'

export type NovelFilterType = 'all' | 'draft' | 'published'

export interface ContextMenuState {
  novel: Novel | null
  position: { x: number, y: number } | null
}

export interface DialogState {
  open: boolean
  novel: Novel | null
}

export interface NovelFormData {
  title: string
  description: string
  coverFile?: File | null
}

export interface NovelListQueryParams {
  page: number
  pageSize: number
  status?: NovelFilterType
}
