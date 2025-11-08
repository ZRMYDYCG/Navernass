import type { ChaptersTabProps } from './types'
import { ChapterHeader } from './chapter-header'
import { ChapterList } from './chapter-list'

export default function ChaptersTab({
  chapters,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateVolume,
  onReorderChapters,
  onRenameChapter,
  onDeleteChapter,
}: ChaptersTabProps) {
  return (
    <div className="h-full flex flex-col">
      <ChapterHeader onCreateChapter={onCreateChapter} onCreateVolume={onCreateVolume} />
      <ChapterList
        chapters={chapters}
        selectedChapter={selectedChapter}
        onSelectChapter={onSelectChapter}
        onReorderChapters={onReorderChapters}
        onRenameChapter={onRenameChapter}
        onDeleteChapter={onDeleteChapter}
      />
    </div>
  )
}
