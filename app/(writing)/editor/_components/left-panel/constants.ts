import type { TabConfig } from './types'
import { LayoutDashboard, PencilLine, Search } from 'lucide-react'

/**
 * 左侧 Tab 配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  { value: 'files', icon: PencilLine },
  { value: 'search', icon: Search },
  { value: 'workspace', icon: LayoutDashboard },
]
