/**
 * 左侧面板相关类型定义
 */

export type LeftTabType = 'files' | 'search' | 'workspace' | 'characters'

export interface Volume {
  id: string
  title: string
  description?: string
  order_index: number
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  title: string
  wordCount: string
  status: string
  volume_id?: string // 所属卷ID
  updated_at?: string // 更新时间
}

export interface TabConfig {
  value: LeftTabType
  label: string
  icon?: React.ComponentType<{ className?: string }>
}
