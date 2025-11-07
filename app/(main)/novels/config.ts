/**
 * 小说列表配置
 */

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

/**
 * 提示消息配置
 */
export const TOAST_MESSAGES = {
  CREATE_SUCCESS: '小说创建成功！',
  UPDATE_SUCCESS: '小说信息已更新！',
  DELETE_SUCCESS: '小说已移到回收站',
  LOAD_ERROR: '加载小说列表失败',
  CREATE_ERROR: '创建小说失败',
  UPDATE_ERROR: '更新小说失败',
  DELETE_ERROR: '删除小说失败',
  TITLE_REQUIRED: '请输入小说标题',
} as const

/**
 * 空状态提示文本
 */
export const EMPTY_STATE_TEXT = {
  NO_NOVELS: '还没有小说',
  CREATE_FIRST: '创建第一部小说',
  CREATE_TIP: '点击右上角创建你的第一部小说',
} as const

/**
 * 对话框配置
 */
export const DIALOG_CONFIG = {
  CREATE_TITLE: '创建小说',
  EDIT_TITLE: '编辑小说',
  DELETE_TITLE: '删除小说',
  DELETE_DESCRIPTION: '确定要将此小说移到回收站吗？',
} as const
