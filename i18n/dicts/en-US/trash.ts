const trash = {
  title: 'Trash',
  loading: 'Loading...',
  empty: {
    title: 'Trash is empty',
    description: 'Archived novels will be kept here. You can restore or permanently delete them at any time.',
  },
  list: {
    deleted: 'Deleted',
    noDescription: 'No description...',
    wordCount: '{{count}}k Words',
    chapterCount: '{{count}} Chapters',
    archivedAt: 'Archived {{time}}',
  },
  actions: {
    restore: 'Restore',
    permanentDelete: 'Delete Permanently',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    selected: 'Selected',
    items: 'items',
  },
  dialog: {
    cancel: 'Cancel',
    confirmDelete: 'Confirm Delete',
    deleting: 'Deleting...',
    singleTitle: 'Delete Novel Permanently',
    singleDescription: 'Are you sure you want to permanently delete "{{title}}"? This action cannot be undone.',
    bulkTitle: 'Bulk Delete Permanently',
    bulkDescription: 'Are you sure you want to permanently delete the {{count}} selected novels? This action cannot be undone.',
  },
  messages: {
    loadFailed: 'Failed to load trash data',
    restoreSuccess: 'Novel "{{title}}" has been restored',
    restoreFailed: 'Failed to restore novel',
    deleteSuccess: 'Novel permanently deleted',
    deleteFailed: 'Failed to delete novel permanently',
    bulkRestoreSuccess: 'Restored {{count}} novels',
    bulkRestoreFailed: 'Failed to bulk restore',
    bulkDeleteSuccess: 'Permanently deleted {{count}} novels',
    bulkDeleteFailed: 'Failed to bulk delete',
  },
} as const

export default trash
