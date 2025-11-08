import { History, Plus } from 'lucide-react'

interface HeaderProps {
  onNewChat?: () => void
  onShowHistory?: () => void
}

export function Header({ onNewChat, onShowHistory }: HeaderProps) {
  return (
    <div className="h-10 flex px-2 items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI 助手</h2>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onNewChat}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="新建对话"
        >
          <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          type="button"
          onClick={onShowHistory}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          title="历史记录"
        >
          <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
