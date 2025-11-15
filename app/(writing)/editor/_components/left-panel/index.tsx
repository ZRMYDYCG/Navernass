import type { Chapter, LeftTabType, Volume } from './types'
import { useState } from 'react'
import ChaptersTab from './chapters'
import { SearchTab } from './search-tab'
import { TabSwitcher } from './tab-switcher'
import WorkspaceTab from './workspace'

interface LeftPanelProps {
  novelTitle?: string
  chapters: Chapter[]
  volumes?: Volume[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateChapterInVolume?: (volumeId: string) => void
  onCreateVolume?: () => void
  onReorderChapters?: (chapters: Array<{ id: string, order_index: number }>) => void
  onReorderVolumes?: (volumes: Array<{ id: string, order_index: number }>) => void
  onMoveChapterToVolume?: (chapterId: string, volumeId: string | null) => void
  onRenameChapter?: (chapter: Chapter) => void
  onDeleteChapter?: (chapter: Chapter) => void
  onCopyChapter?: (chapter: Chapter) => void
  onRenameVolume?: (volume: Volume) => void
  onDeleteVolume?: (volume: Volume) => void
}

export default function LeftPanel({
  novelTitle,
  chapters,
  volumes = [],
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
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTabType>('files')

  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'files' && (
          <ChaptersTab
            novelTitle={novelTitle}
            chapters={chapters}
            volumes={volumes}
            selectedChapter={selectedChapter}
            onSelectChapter={onSelectChapter}
            onCreateChapter={onCreateChapter}
            onCreateChapterInVolume={onCreateChapterInVolume}
            onCreateVolume={onCreateVolume}
            onReorderChapters={onReorderChapters}
            onReorderVolumes={onReorderVolumes}
            onMoveChapterToVolume={onMoveChapterToVolume}
            onRenameChapter={onRenameChapter}
            onDeleteChapter={onDeleteChapter}
            onCopyChapter={onCopyChapter}
            onRenameVolume={onRenameVolume}
            onDeleteVolume={onDeleteVolume}
          />
        )}

        {activeTab === 'search' && <SearchTab />}

        {activeTab === 'workspace' && <WorkspaceTab />}
      </div>
    </div>
  )
}
