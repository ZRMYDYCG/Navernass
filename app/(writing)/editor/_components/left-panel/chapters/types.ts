import type { Chapter, Volume } from '../types'

export interface ChaptersTabProps {
  novelTitle?: string
  chapters: Chapter[]
  volumes: Volume[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateChapterQuick?: () => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCreateVolume?: () => void
  onCreateVolumeQuick?: () => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onRenameChapterInline?: (chapterId: string, title: string) => Promise<void> | void
  onDeleteChapter?: (chapter: Chapter) => void
  onCopyChapter?: (chapter: Chapter) => Promise<void>
  onMoveChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
}

export interface ChapterItemProps {
  chapter: Chapter
  isSelected: boolean
  onSelect: () => void
  onRename?: (chapter: Chapter) => void
  onRenameInline?: (chapterId: string, title: string) => Promise<void> | void
  onDelete?: (chapter: Chapter) => void
  onCopy?: (chapter: Chapter) => Promise<void>
  onMove?: (chapter: Chapter) => void
}
