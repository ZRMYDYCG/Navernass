import type { Chapter, Volume } from '../types'

export interface ChaptersTabProps {
  chapters: Chapter[]
  volumes: Volume[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
}

export interface ChapterItemProps {
  chapter: Chapter
  isSelected: boolean
  onSelect: () => void
  onRename?: (chapter: Chapter) => void
  onDelete?: (chapter: Chapter) => void
}
