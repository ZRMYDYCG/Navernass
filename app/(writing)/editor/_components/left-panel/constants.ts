import type { TabConfig } from './types'
import { LayoutDashboard, PencilLine, Search } from 'lucide-react'

/**
 * 左侧 Tab 配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  { value: 'files', label: '文件', icon: PencilLine },
  { value: 'search', label: '搜索', icon: Search },
  { value: 'workspace', label: '工作区', icon: LayoutDashboard },
]
