/**
 * 左侧面板相关类型定义
 */

export type LeftTabType = 'chapters' | 'workspace' | 'materials'

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
}

export interface TabConfig {
  value: LeftTabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}
