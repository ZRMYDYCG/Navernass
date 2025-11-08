import type { Chapter, LeftTabType } from './types'
import { useState } from 'react'
import ChaptersTab from './chapters'
import { TabSwitcher } from './tab-switcher'
import WorkspaceTab from './workspace'

interface LeftPanelProps {
  chapters: Chapter[]
  selectedChapter: string | null
  onSelectChapter: (id: string) => void
  onCreateChapter?: () => void
  onCreateVolume?: () => void
}

export default function LeftPanel({
  chapters,
  selectedChapter,
  onSelectChapter,
  onCreateChapter,
  onCreateVolume,
}: LeftPanelProps) {
  const [activeTab, setActiveTab] = useState<LeftTabType>('chapters')

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />

      <div className="flex-1 overflow-hidden">
        {activeTab === 'chapters' && (
          <ChaptersTab
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelectChapter={onSelectChapter}
            onCreateChapter={onCreateChapter}
            onCreateVolume={onCreateVolume}
          />
        )}

        {activeTab === 'workspace' && <WorkspaceTab />}
      </div>
    </div>
  )
}
