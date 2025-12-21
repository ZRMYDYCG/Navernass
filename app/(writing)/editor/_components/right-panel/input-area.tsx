import { useEffect, useRef } from 'react'

interface InputAreaProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
}

export function InputArea({ value, onChange, onSend, disabled }: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      const scrollHeight = el.scrollHeight
      const maxHeight = 96
      const newHeight = Math.min(scrollHeight, maxHeight)
      el.style.height = `${newHeight}px`
      el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden'
    }
  }

  useEffect(() => {
    adjustHeight()
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight()
    onChange(e.target.value)
  }

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="询问 AI 助手..."
      rows={1}
      disabled={disabled}
      className="input-area-scrollbar flex-1 px-3 py-2.5 text-[13px] border border-border rounded-lg bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent focus:bg-background focus:shadow-md transition-all duration-200 resize-none max-h-24 overflow-y-auto disabled:cursor-not-allowed hover:bg-background/80 shadow-sm"
      style={{
        minHeight: '40px',
      }}
    />
  )
}
