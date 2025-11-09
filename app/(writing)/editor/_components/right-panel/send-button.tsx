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
      className="p-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 dark:bg-gray-100 dark:hover:bg-gray-200 dark:disabled:bg-gray-700 text-white dark:text-gray-900 disabled:text-gray-500 rounded-lg transition-colors flex-shrink-0 disabled:cursor-not-allowed"
      title="发送 (Enter)"
    >
      <Send className="w-4 h-4" />
    </button>
  )
}
