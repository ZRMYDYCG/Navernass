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
      className="p-1.5 h-6 w-6 flex items-center justify-center bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 dark:bg-zinc-100 dark:hover:bg-gray-200 dark:disabled:bg-gray-700 text-white dark:text-gray-900 disabled:text-gray-500 rounded transition-all duration-200 shrink-0 disabled:cursor-not-allowed hover:scale-110 active:scale-95 disabled:scale-100"
      title="发送 (Enter)"
    >
      <Send className="w-3 h-3" />
    </button>
  )
}
