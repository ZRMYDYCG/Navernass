const trash = {
  title: '휴지통',
  loading: '불러오는 중...',
  empty: {
    title: '휴지통이 비어 있습니다',
    description: '보관된 소설이 여기에 저장됩니다. 언제든지 복원하거나 영구 삭제할 수 있습니다.',
  },
  list: {
    deleted: '삭제됨',
    noDescription: '설명 없음...',
    wordCount: '{{count}}k 단어',
    chapterCount: '{{count}}개 장',
    archivedAt: '{{time}}에 보관됨',
  },
  actions: {
    restore: '복원',
    permanentDelete: '영구 삭제',
    selectAll: '전체 선택',
    deselectAll: '선택 해제',
    selected: '선택됨',
    items: '개 항목',
  },
  dialog: {
    cancel: '취소',
    confirmDelete: '삭제 확인',
    deleting: '삭제 중...',
    singleTitle: '소설 영구 삭제',
    singleDescription: '"{{title}}"을(를) 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    bulkTitle: '선택 항목 영구 삭제',
    bulkDescription: '선택한 소설 {{count}}개를 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
  },
  messages: {
    loadFailed: '휴지통 데이터를 불러오지 못했습니다',
    restoreSuccess: '소설 "{{title}}"이(가) 복원되었습니다',
    restoreFailed: '소설 복원에 실패했습니다',
    deleteSuccess: '소설이 영구 삭제되었습니다',
    deleteFailed: '소설 영구 삭제에 실패했습니다',
    bulkRestoreSuccess: '소설 {{count}}개를 복원했습니다',
    bulkRestoreFailed: '일괄 복원에 실패했습니다',
    bulkDeleteSuccess: '소설 {{count}}개를 영구 삭제했습니다',
    bulkDeleteFailed: '일괄 삭제에 실패했습니다',
  },
} as const

export default trash
