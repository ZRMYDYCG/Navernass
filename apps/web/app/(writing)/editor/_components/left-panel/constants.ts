import type { TabConfig } from './types'
import { Globe2, PencilLine, Search } from 'lucide-react'

/**
 * 左侧 Tab 配置
 */
export const TAB_CONFIGS: TabConfig[] = [
  { value: 'files', icon: PencilLine },
  { value: 'search', icon: Search },
  { value: 'worldview', icon: Globe2 },
]
