import type { Chapter } from '../types'

export interface ChaptersTabProps {
  chapters: Chapter[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateVolume?: () => void
  onReorderChapters?: (chapters: Chapter[]) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
}

export interface ChapterItemProps {
  chapter: Chapter
  isSelected: boolean
  onSelect: () => void
  onRename?: (chapter: Chapter) => void
  onDelete?: (chapter: Chapter) => void
}
