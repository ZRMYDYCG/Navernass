'use client'

import { useEffect, useRef, useState } from 'react'

interface InputDialogProps {
  isOpen: boolean
  title: string
  placeholder: string
  defaultValue?: string
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function InputDialog({
  isOpen,
  title,
  placeholder,
  defaultValue = '',
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      // 延迟聚焦，确保 DOM 已渲染
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setValue(defaultValue)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen, defaultValue])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog 内容 */}
      <div className="relative bg-popover rounded-lg shadow-2xl w-full max-w-md mx-4 border border-border">
        <form onSubmit={handleSubmit}>
          {/* 标题 */}
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">
              {title}
            </h3>
          </div>

          {/* 输入框 */}
          <div className="px-6 py-4">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring/50"
            />
          </div>

          {/* 按钮组 */}
          <div className="px-6 py-4 bg-accent/50 rounded-b-lg flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
