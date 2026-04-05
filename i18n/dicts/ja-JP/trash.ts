const trash = {
  title: 'ゴミ箱',
  loading: '読み込み中...',
  empty: {
    title: 'ゴミ箱は空です',
    description: 'アーカイブした小説はここに保管されます。いつでも復元または完全削除できます。',
  },
  list: {
    deleted: '削除済み',
    noDescription: '説明なし...',
    wordCount: '{{count}}k文字',
    chapterCount: '{{count}}章',
    archivedAt: '{{time}}にアーカイブ',
  },
  actions: {
    restore: '復元',
    permanentDelete: '完全削除',
    selectAll: 'すべて選択',
    deselectAll: '選択解除',
    selected: '選択中',
    items: '件',
  },
  dialog: {
    cancel: 'キャンセル',
    confirmDelete: '削除の確認',
    deleting: '削除中...',
    singleTitle: '小説を完全に削除',
    singleDescription: '「{{title}}」を完全に削除しますか？この操作は元に戻せません。',
    bulkTitle: '選択分を完全に削除',
    bulkDescription: '選択した{{count}}件の小説を完全に削除しますか？この操作は元に戻せません。',
  },
  messages: {
    loadFailed: 'ゴミ箱データの読み込みに失敗しました',
    restoreSuccess: '小説「{{title}}」を復元しました',
    restoreFailed: '小説の復元に失敗しました',
    deleteSuccess: '小説を完全に削除しました',
    deleteFailed: '小説の完全削除に失敗しました',
    bulkRestoreSuccess: '{{count}}件の小説を復元しました',
    bulkRestoreFailed: '一括復元に失敗しました',
    bulkDeleteSuccess: '{{count}}件の小説を完全に削除しました',
    bulkDeleteFailed: '一括削除に失敗しました',
  },
} as const

export default trash
