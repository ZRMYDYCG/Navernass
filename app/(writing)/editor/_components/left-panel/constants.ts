import type { TabConfig } from './types'
import { Briefcase, List } from 'lucide-react'

/**
 * 左侧 Tab 配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  { value: 'chapters', label: '章节管理', icon: List },
  { value: 'workspace', label: '工作区', icon: Briefcase },
]
