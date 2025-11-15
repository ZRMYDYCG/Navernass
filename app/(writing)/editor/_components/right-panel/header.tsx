import { History, Plus } from 'lucide-react'

interface HeaderProps {
  onNewChat?: () => void
  onShowHistory?: () => void
}

export function Header({ onNewChat, onShowHistory }: HeaderProps) {
  return (
    <div className="h-7 flex px-1.5 items-center justify-end bg-gray-100 dark:bg-gray-800">
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={onNewChat}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-105 active:scale-95"
          title="新建对话"
        >
          <Plus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
        <button
          type="button"
          onClick={onShowHistory}
          className="p-1 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 hover:scale-105 active:scale-95"
          title="历史记录"
        >
          <History className="w-3 h-3 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  )
}
