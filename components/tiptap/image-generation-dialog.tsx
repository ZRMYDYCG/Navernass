'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface ImageGenerationDialogProps {
  isOpen: boolean
  onConfirm: (prompt: string, size: string) => Promise<void> | void
  onCancel: () => void
  isGenerating?: boolean
}

export function ImageGenerationDialog({
  isOpen,
  onConfirm,
  onCancel,
  isGenerating = false,
}: ImageGenerationDialogProps) {
  const [prompt, setPrompt] = useState('')
  const [size, setSize] = useState('1024x1024')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setPrompt('')
      setSize('1024x1024')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      await onConfirm(prompt.trim(), size)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      <div className="relative bg-popover rounded-lg shadow-2xl w-full max-w-lg mx-4 border border-border">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-medium text-foreground">
              AI 生成插画
            </h3>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                图片描述
              </label>
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你想要生成的图片..."
                className="w-full px-4 py-2.5 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring/50 resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                图片比例
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '1:1', value: '1024x1024' },
                  { label: '16:9', value: '1024x576' },
                  { label: '4:3', value: '1024x768' },
                  { label: '3:2', value: '1024x683' },
                  { label: '2:3', value: '683x1024' },
                  { label: '3:4', value: '768x1024' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSize(option.value)}
                    className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                      size === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input bg-background text-foreground hover:bg-accent'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-accent/50 rounded-b-lg flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isGenerating}
              className="px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded-md transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
            >
              {isGenerating ? '生成中...' : '生成图片'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
