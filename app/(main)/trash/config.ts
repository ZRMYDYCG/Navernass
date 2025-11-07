/**
 * 回收站配置
 */

/**
 * 提示消息配置
 */
export const TOAST_MESSAGES = {
  RESTORE_SUCCESS: (title: string) => `小说《${title}》已恢复`,
  BULK_RESTORE_SUCCESS: (count: number) => `已恢复 ${count} 部小说`,
  DELETE_SUCCESS: '小说已永久删除',
  BULK_DELETE_SUCCESS: (count: number) => `已永久删除 ${count} 部小说`,
  LOAD_ERROR: '加载回收站数据失败',
  RESTORE_ERROR: '恢复小说失败',
  BULK_RESTORE_ERROR: '批量恢复失败',
  DELETE_ERROR: '永久删除小说失败',
  BULK_DELETE_ERROR: '批量删除失败',
} as const

/**
 * 对话框配置
 */
export const DIALOG_CONFIG = {
  SINGLE_DELETE_TITLE: '永久删除小说',
  BULK_DELETE_TITLE: '批量永久删除',
  SINGLE_DELETE_DESCRIPTION: (title: string) =>
    `确定要永久删除小说《${title}》吗？此操作无法撤销！`,
  BULK_DELETE_DESCRIPTION: (count: number) =>
    `确定要永久删除选中的 ${count} 部小说吗？此操作无法撤销！`,
} as const

/**
 * 空状态提示文本
 */
export const EMPTY_STATE_TEXT = {
  TITLE: '回收站是空的',
  DESCRIPTION: '归档的小说会保留在这里',
} as const

/**
 * 页面标题配置
 */
export const PAGE_CONFIG = {
  TITLE: '回收站',
  COUNT_TEXT: (count: number) => (count > 0 ? `${count} 部已归档` : '暂无归档内容'),
} as const
