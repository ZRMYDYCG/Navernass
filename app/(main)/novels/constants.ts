/**
 * 每页显示的小说数量
 */
export const ITEMS_PER_PAGE = 8

/**
 * 默认视图模式
 */
export const DEFAULT_VIEW_MODE = 'grid' as const

/**
 * 默认筛选类型
 */
export const DEFAULT_FILTER = 'all' as const

/**
 * 筛选选项配置
 */
export const FILTER_OPTIONS = [
  { value: 'all', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'published', label: '已发布' },
] as const
