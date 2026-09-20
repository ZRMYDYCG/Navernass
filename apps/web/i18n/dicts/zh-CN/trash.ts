const trash = {
  title: '回收站',
  loading: '加载中...',
  empty: {
    title: '回收站是空的',
    description: '归档的小说会保留在这里，你可以随时恢复或永久删除它们',
  },
  list: {
    deleted: '已删除',
    noDescription: '暂无简介...',
    wordCount: '{{count}}k 字',
    chapterCount: '{{count}} 章节',
    archivedAt: '归档于 {{time}}',
  },
  actions: {
    restore: '恢复',
    permanentDelete: '永久删除',
    selectAll: '全选',
    deselectAll: '取消选择',
    selected: '已选择',
    items: '项',
  },
  dialog: {
    cancel: '取消',
    confirmDelete: '确认删除',
    deleting: '删除中...',
    singleTitle: '永久删除小说',
    singleDescription: '确定要永久删除小说《{{title}}》吗？此操作无法撤销。',
    bulkTitle: '批量永久删除',
    bulkDescription: '确定要永久删除选中的 {{count}} 部小说吗？此操作无法撤销。',
  },
  messages: {
    loadFailed: '加载回收站数据失败',
    restoreSuccess: '小说《{{title}}》已恢复',
    restoreFailed: '恢复小说失败',
    deleteSuccess: '小说已永久删除',
    deleteFailed: '永久删除小说失败',
    bulkRestoreSuccess: '已恢复 {{count}} 部小说',
    bulkRestoreFailed: '批量恢复失败',
    bulkDeleteSuccess: '已永久删除 {{count}} 部小说',
    bulkDeleteFailed: '批量删除失败',
  },
} as const

export default trash
