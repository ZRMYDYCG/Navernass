import * as Tooltip from '@radix-ui/react-tooltip'
import { Briefcase, List } from 'lucide-react'
import { useState } from 'react'
import ChaptersTab from './tabs/chapters-tab'
import WorkspaceTab from './tabs/workspace-tab'

type LeftTabType = 'chapters' | 'workspace'

interface Chapter {
  id: string
  title: string
  wordCount: string
  status: string
}

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
  const [leftTab, setLeftTab] = useState<LeftTabType>('chapters')

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
      {/* Tab图标栏 */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => setLeftTab('chapters')}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                leftTab === 'chapters'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="bottom"
              className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded"
              sideOffset={5}
            >
              章节管理
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              onClick={() => setLeftTab('workspace')}
              className={`w-10 h-10 flex items-center justify-center rounded-md transition-colors ${
                leftTab === 'workspace'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Briefcase className="w-5 h-5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="bottom"
              className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded"
              sideOffset={5}
            >
              工作区
              <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      {/* Tab内容区域 */}
      <div className="flex-1 overflow-hidden">
        {leftTab === 'chapters' && (
          <ChaptersTab
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelectChapter={onSelectChapter}
            onCreateChapter={onCreateChapter}
            onCreateVolume={onCreateVolume}
          />
        )}

        {leftTab === 'workspace' && <WorkspaceTab />}
      </div>
    </div>
  )
}
