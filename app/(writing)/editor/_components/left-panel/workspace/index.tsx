import { ActionButtons } from './action-buttons'
import { ChapterInfo } from './chapter-info'

export default function WorkspaceTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">工作区</h2>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full p-4 space-y-4">
        <ActionButtons />
        <ChapterInfo />
      </div>
    </div>
  )
}
