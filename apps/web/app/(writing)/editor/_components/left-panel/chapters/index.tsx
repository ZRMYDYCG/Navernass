import type { ChaptersTabProps } from './types'
import { useRef, useState } from 'react'
import { ChapterHeader } from './chapter-header'
import { ChapterList } from './chapter-list'
import { PlanDrawer } from './plan-drawer'

export default function ChaptersTab({
  novelTitle,
  novelId,
  chapters,
  volumes,
  selectedChapter,
  selectedPlanFileId,
  onSelectChapter,
  onSelectPlanFile,
  onCreateChapter,
  onCreateChapterQuick,
  onCreateChapterInVolume,
  onCreateVolume,
  onCreateVolumeQuick,
  onReorderChapters,
  onReorderVolumes,
  onMoveChapterToVolume,
  onRenameChapter,
  onDeleteChapter,
  onCopyChapter,
  onMoveChapter,
  onRenameVolume,
  onDeleteVolume,
  onRenameChapterInline,
  onChaptersImported,
}: ChaptersTabProps) {
  const toggleAllVolumesRef = useRef<(() => void) | null>(null)
  const [allVolumesExpanded, setAllVolumesExpanded] = useState(true)
  const [hasVolumes, setHasVolumes] = useState(false)

  return (
    <div className="h-full flex flex-col isolate">
      <ChapterHeader
        novelTitle={novelTitle}
        novelId={novelId}
        chapters={chapters}
        volumes={volumes}
        onCreateChapter={onCreateChapterQuick ?? onCreateChapter}
        onCreateVolume={onCreateVolumeQuick ?? onCreateVolume}
        allVolumesExpanded={allVolumesExpanded}
        hasVolumes={hasVolumes}
        onToggleAllVolumes={() => {
          toggleAllVolumesRef.current?.()
        }}
        onChaptersImported={onChaptersImported}
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
        onRenameChapterInline={onRenameChapterInline}
        onDeleteChapter={onDeleteChapter}
        onCopyChapter={onCopyChapter}
        onMoveChapter={onMoveChapter}
        onRenameVolume={onRenameVolume}
        onDeleteVolume={onDeleteVolume}
        onCreateChapterInVolume={onCreateChapterInVolume}
        onCreateChapter={onCreateChapter}
        onCreateVolume={onCreateVolume}
        onToggleAllVolumesRef={toggleAllVolumesRef}
        onAllVolumesExpandedChange={setAllVolumesExpanded}
        onHasVolumesChange={setHasVolumes}
      />
      <PlanDrawer
        novelId={novelId}
        selectedPlanFileId={selectedPlanFileId}
        onSelectPlanFile={onSelectPlanFile}
      />
    </div>
  )
}
