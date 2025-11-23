import type { TabConfig } from './types'
import { FileText, Grid3x3, Search, Users } from 'lucide-react'

/**
 * 左侧 Tab 配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  { value: 'files', label: '文件', icon: FileText },
  { value: 'search', label: '搜索', icon: Search },
  { value: 'characters', label: '角色', icon: Users },
  { value: 'workspace', label: '工作区', icon: Grid3x3 },
]
