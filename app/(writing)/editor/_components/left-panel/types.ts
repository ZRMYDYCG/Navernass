/**
 * 左侧面板相关类型定义
 */

export type LeftTabType = 'chapters' | 'workspace' | 'materials'

export interface Chapter {
  id: string
  title: string
  wordCount: string
  status: string
}

export interface TabConfig {
  value: LeftTabType
  label: string
  icon: React.ComponentType<{ className?: string }>
}
