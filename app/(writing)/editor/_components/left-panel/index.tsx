import type { Chapter, LeftTabType, Volume } from './types'
import { useState } from 'react'
import ChaptersTab from './chapters'
import { TabSwitcher } from './tab-switcher'
import WorkspaceTab from './workspace'

interface LeftPanelProps {
  chapters: Chapter[]
  volumes?: Volume[]
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

export default function LeftPanel({
  chapters,
  volumes = [],
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
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTabType>('chapters')

  return (
    <div className="h-full flex flex-col bg-background border-r border-border">
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'chapters' && (
          <ChaptersTab
            chapters={chapters}
            volumes={volumes}
            selectedChapter={selectedChapter}
            onSelectChapter={onSelectChapter}
            onCreateChapter={onCreateChapter}
            onCreateVolume={onCreateVolume}
            onReorderChapters={onReorderChapters}
            onReorderVolumes={onReorderVolumes}
            onMoveChapterToVolume={onMoveChapterToVolume}
            onRenameChapter={onRenameChapter}
            onDeleteChapter={onDeleteChapter}
            onRenameVolume={onRenameVolume}
            onDeleteVolume={onDeleteVolume}
          />
        )}

        {activeTab === 'workspace' && <WorkspaceTab />}
      </div>
    </div>
  )
}
