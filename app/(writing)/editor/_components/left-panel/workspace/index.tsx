import type { Volume } from '../types'
import { ActionButtons } from './action-buttons'
import { QuickActions } from './quick-actions'

interface Chapter {
  id: string
  title: string
}

interface WorkspaceTabProps {
  chapters: Chapter[]
  novelId: string
  volumes?: Volume[]
  onChaptersImported?: () => void
}

export default function WorkspaceTab({ chapters, novelId, volumes = [], onChaptersImported }: WorkspaceTabProps) {
  return (
    <div className="h-full flex flex-col bg-gray-100 dark:bg-gray-800">
      <div className="h-7 px-1.5 flex items-center justify-between bg-gray-100 dark:bg-gray-800">
        <h2 className="text-xs font-medium text-gray-700 dark:text-gray-300">工作区</h2>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-800 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full px-1.5 py-2 space-y-2">
        <ActionButtons chapters={chapters} novelId={novelId} volumes={volumes} onChaptersImported={onChaptersImported} />
        <QuickActions />
      </div>
    </div>
  )
}
