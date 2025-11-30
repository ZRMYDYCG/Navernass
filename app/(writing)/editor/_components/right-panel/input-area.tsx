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
      className="input-area-scrollbar flex-1 px-3 py-2.5 text-[13px] border border-stone-200 dark:border-zinc-800 rounded-lg bg-white/50 dark:bg-zinc-800/50 text-[#333333] dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-stone-300 dark:focus:ring-zinc-700 focus:border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:shadow-md transition-all duration-200 resize-none max-h-24 overflow-y-auto disabled:cursor-not-allowed hover:bg-white/80 dark:hover:bg-zinc-800/80 shadow-sm"
      style={{
        minHeight: '48px',
        height: 'auto',
      }}
    />
  )
}
