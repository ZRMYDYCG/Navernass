import { useRef } from 'react'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function InputArea({ value, onChange, onSend, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="询问 AI 助手..."
      rows={1}
      disabled={disabled}
      className="input-area-scrollbar flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all duration-200 resize-none max-h-24 overflow-y-auto disabled:cursor-not-allowed hover:border-gray-300 dark:hover:border-gray-600"
      style={{
        minHeight: '60px',
        height: 'auto',
      }}
    />
  )
}
