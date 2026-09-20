const trash = {
  title: '回收站',
  loading: '載入中...',
  empty: {
    title: '回收站是空的',
    description: '歸檔的小說會保留在這裡，你可以隨時恢復或永久刪除它們',
  },
  list: {
    deleted: '已刪除',
    noDescription: '暫無簡介...',
    wordCount: '{{count}}k 字',
    chapterCount: '{{count}} 章節',
    archivedAt: '歸檔於 {{time}}',
  },
  actions: {
    restore: '恢復',
    permanentDelete: '永久刪除',
    selectAll: '全選',
    deselectAll: '取消選擇',
    selected: '已選擇',
    items: '項',
  },
  dialog: {
    cancel: '取消',
    confirmDelete: '確認刪除',
    deleting: '刪除中...',
    singleTitle: '永久刪除小說',
    singleDescription: '確定要永久刪除小說《{{title}}》嗎？此操作無法撤銷。',
    bulkTitle: '批次永久刪除',
    bulkDescription: '確定要永久刪除選中的 {{count}} 部小說嗎？此操作無法撤銷。',
  },
  messages: {
    loadFailed: '載入回收站資料失敗',
    restoreSuccess: '小說《{{title}}》已恢復',
    restoreFailed: '恢復小說失敗',
    deleteSuccess: '小說已永久刪除',
    deleteFailed: '永久刪除小說失敗',
    bulkRestoreSuccess: '已恢復 {{count}} 部小說',
    bulkRestoreFailed: '批次恢復失敗',
    bulkDeleteSuccess: '已永久刪除 {{count}} 部小說',
    bulkDeleteFailed: '批次刪除失敗',
  },
} as const

export default trash
