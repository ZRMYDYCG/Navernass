import { AtSign } from 'lucide-react'

interface AtButtonProps {
  onClick?: () => void
}

export function AtButton({ onClick }: AtButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 h-6 w-6 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all duration-200 border border-gray-200 dark:border-gray-700 shrink-0 hover:scale-110 active:scale-95"
      title="引用章节内容"
    >
      <AtSign className="w-3 h-3 text-gray-600 dark:text-gray-400" />
    </button>
  )
}
