const trash = {
  title: 'Papierkorb',
  loading: 'Wird geladen...',
  empty: {
    title: 'Papierkorb ist leer',
    description: 'Archivierte Romane werden hier aufbewahrt. Sie können sie jederzeit wiederherstellen oder dauerhaft löschen.',
  },
  list: {
    deleted: 'Gelöscht',
    noDescription: 'Keine Beschreibung...',
    wordCount: '{{count}}k Wörter',
    chapterCount: '{{count}} Kapitel',
    archivedAt: 'Archiviert {{time}}',
  },
  actions: {
    restore: 'Wiederherstellen',
    permanentDelete: 'Dauerhaft löschen',
    selectAll: 'Alles auswählen',
    deselectAll: 'Alles abwählen',
    selected: 'Ausgewählt',
    items: 'Elemente',
  },
  dialog: {
    cancel: 'Abbrechen',
    confirmDelete: 'Löschen bestätigen',
    deleting: 'Wird gelöscht...',
    singleTitle: 'Roman dauerhaft löschen',
    singleDescription: 'Möchten Sie "{{title}}" wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    bulkTitle: 'Dauerhaft gesammelt löschen',
    bulkDescription: 'Möchten Sie die {{count}} ausgewählten Romane wirklich dauerhaft löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
  },
  messages: {
    loadFailed: 'Papierkorb-Daten konnten nicht geladen werden',
    restoreSuccess: 'Roman "{{title}}" wurde wiederhergestellt',
    restoreFailed: 'Roman konnte nicht wiederhergestellt werden',
    deleteSuccess: 'Roman wurde dauerhaft gelöscht',
    deleteFailed: 'Roman konnte nicht dauerhaft gelöscht werden',
    bulkRestoreSuccess: '{{count}} Romane wiederhergestellt',
    bulkRestoreFailed: 'Gesammelte Wiederherstellung fehlgeschlagen',
    bulkDeleteSuccess: '{{count}} Romane dauerhaft gelöscht',
    bulkDeleteFailed: 'Gesammeltes Löschen fehlgeschlagen',
  },
} as const

export default trash
