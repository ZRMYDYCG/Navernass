import { AtSign } from 'lucide-react'

interface AtButtonProps {
  onClick?: () => void
}

export function AtButton({ onClick }: AtButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-200/50 dark:hover:bg-zinc-700 rounded-md transition-all duration-200 border border-transparent hover:border-stone-200 dark:hover:border-zinc-600 shrink-0 text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200"
      title="引用章节内容"
    >
      <AtSign className="w-3.5 h-3.5" />
    </button>
  )
}
