import { AtSign } from 'lucide-react'

interface AtButtonProps {
  onClick?: () => void
}

export function AtButton({ onClick }: AtButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors border border-gray-200 dark:border-gray-700 flex-shrink-0"
      title="引用章节内容"
    >
      <AtSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
    </button>
  )
}
