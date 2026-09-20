import type { Novel } from '@/lib/supabase/sdk'

/**
 * 删除类型
 */
export type DeleteType = 'single' | 'bulk'

/**
 * 右键菜单状态
 */
export interface ContextMenuState {
  novel: Novel | null
  position: { x: number, y: number } | null
}

/**
 * 删除确认对话框状态
 */
export interface DeleteDialogState {
  open: boolean
  type: DeleteType
  novel: Novel | null
  count: number
}

/**
 * 批量操作配置
 */
export interface BulkActionsConfig {
  selectedCount: number
  totalCount: number
}
