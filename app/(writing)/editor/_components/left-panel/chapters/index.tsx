import type { ChaptersTabProps } from './types'
import { useRef } from 'react'
import { ChapterHeader } from './chapter-header'
import { ChapterList } from './chapter-list'

export default function ChaptersTab({
  novelTitle,
  chapters,
  volumes,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateChapterInVolume,
  onCreateVolume,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onDeleteChapter,
  onCopyChapter,
  onRenameVolume,
  onDeleteVolume,
}: ChaptersTabProps) {
  const collapseAllRef = useRef<(() => void) | null>(null)

  return (
    <div className="h-full flex flex-col">
      <ChapterHeader
        novelTitle={novelTitle}
        onCreateChapter={onCreateChapter}
        onCreateVolume={onCreateVolume}
        onRefresh={() => {
          // TODO: 实现刷新功能
          window.location.reload()
        }}
        onCollapseAll={() => {
          collapseAllRef.current?.()
        }}
      />
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
        onCopyChapter={onCopyChapter}
        onRenameVolume={onRenameVolume}
        onDeleteVolume={onDeleteVolume}
        onCreateChapterInVolume={onCreateChapterInVolume}
        onCollapseAllRef={collapseAllRef}
      />
    </div>
  )
}
