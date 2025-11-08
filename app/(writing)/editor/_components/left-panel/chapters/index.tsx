import type { ChaptersTabProps } from './types'
import { ChapterHeader } from './chapter-header'
import { ChapterList } from './chapter-list'

export default function ChaptersTab({
  chapters,
  volumes,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateVolume,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onDeleteChapter,
  onRenameVolume,
  onDeleteVolume,
}: ChaptersTabProps) {
  return (
    <div className="h-full flex flex-col">
      <ChapterHeader onCreateChapter={onCreateChapter} onCreateVolume={onCreateVolume} />
      <ChapterList
        chapters={chapters}
        volumes={volumes}
        selectedChapter={selectedChapter}
        onSelectChapter={onSelectChapter}
        onReorderChapters={onReorderChapters}
        onReorderVolumes={onReorderVolumes}
        onMoveChapterToVolume={onMoveChapterToVolume}
        onRenameChapter={onRenameChapter}
        onDeleteChapter={onDeleteChapter}
        onRenameVolume={onRenameVolume}
        onDeleteVolume={onDeleteVolume}
      />
    </div>
  )
}
