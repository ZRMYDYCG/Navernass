import type { Novel } from '@/lib/supabase/sdk'

/**
 * 视图模式类型
 */
export type ViewMode = 'grid' | 'table'

/**
 * 小说筛选类型
 */
export type NovelFilterType = 'all' | 'draft' | 'published'

/**
 * 右键菜单状态
 */
export interface ContextMenuState {
  novel: Novel | null
  position: { x: number, y: number } | null
}

/**
 * 对话框状态
 */
export interface DialogState {
  open: boolean
  novel: Novel | null
}

/**
 * 小说表单数据
 */
export interface NovelFormData {
  title: string
  description: string
}

/**
 * 小说列表查询参数
 */
export interface NovelListQueryParams {
  page: number
  pageSize: number
  status?: NovelFilterType
}
