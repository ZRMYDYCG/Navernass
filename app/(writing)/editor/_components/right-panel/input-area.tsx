import { AtSign, Send } from 'lucide-react'
import { useRef } from 'react'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onAtClick?: () => void
  disabled?: boolean
}

export function InputArea({ value, onChange, onSend, onAtClick, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex gap-2 items-end">
      {/* @ 按钮 */}
      <button
        type="button"
        onClick={onAtClick}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors border border-gray-200 dark:border-gray-700 flex-shrink-0"
        title="引用章节内容"
      >
        <AtSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>

      {/* 文本输入框 */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="询问 AI 助手..."
        rows={1}
        disabled={disabled}
        className="input-area-scrollbar flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-transparent transition-all resize-none max-h-32 overflow-y-auto disabled:cursor-not-allowed"
        style={{
          minHeight: '80px',
          height: 'auto',
        }}
      />

      {/* 发送按钮 */}
      <button
        type="button"
        onClick={onSend}
        disabled={!value.trim() || disabled}
        className="p-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 dark:bg-gray-100 dark:hover:bg-gray-200 dark:disabled:bg-gray-700 text-white dark:text-gray-900 disabled:text-gray-500 rounded-lg transition-colors flex-shrink-0 disabled:cursor-not-allowed"
        title="发送 (Enter)"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}
