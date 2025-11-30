import { Send } from 'lucide-react'

interface SendButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function SendButton({ onClick, disabled }: SendButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="p-1.5 h-7 w-7 flex items-center justify-center bg-[#333333] hover:bg-black disabled:bg-stone-200 dark:bg-zinc-100 dark:hover:bg-white dark:disabled:bg-zinc-800 text-white dark:text-zinc-900 disabled:text-stone-400 dark:disabled:text-zinc-600 rounded-md transition-all duration-200 shrink-0 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-95"
      title="发送 (Enter)"
    >
      <Send className="w-3.5 h-3.5" />
    </button>
  )
}
