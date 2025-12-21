'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, MessageCircle, Sparkles, Underline as UnderlineIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FormatToolbarProps {
  editor: Editor
  onAIClick?: () => void
  isAIActive?: boolean
  isAILoading?: boolean
}

export function FormatToolbar({ editor, onAIClick, isAIActive, isAILoading }: FormatToolbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  return (
    <div className="flex items-center gap-0.5 p-0.5 bg-popover border border-border rounded shadow-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-accent transition-colors ${
          editor.isActive('bold') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        }`}
        title="加粗"
      >
        <Bold className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-accent transition-colors ${
          editor.isActive('italic') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        }`}
        title="斜体"
      >
        <Italic className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-accent transition-colors ${
          editor.isActive('underline') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
        }`}
        title="下划线"
      >
        <UnderlineIcon className="w-3 h-3" />
      </button>

      {onAIClick && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              const { from, to } = editor.state.selection
              if (from === to) return

              const doc = editor.state.doc
              const selectedText = doc.textBetween(from, to, '\n\n')?.trim()
              if (!selectedText) return

              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('novel-ai-insert-from-editor', {
                    detail: { text: selectedText },
                  }),
                )
              }
            }}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
            title="将选中文本发送到右侧 AI 面板"
          >
            <MessageCircle className="w-3 h-3" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              const { from, to } = editor.state.selection
              const savedSelection = from !== to ? { from, to } : null

              if (savedSelection) {
                setTimeout(() => {
                  editor.chain().focus().setTextSelection({ from: savedSelection.from, to: savedSelection.to }).run()
                  requestAnimationFrame(() => {
                    onAIClick?.()
                  })
                }, 0)
              } else {
                editor.chain().focus().run()
                requestAnimationFrame(() => {
                  onAIClick?.()
                })
              }
            }}
            disabled={isAILoading}
            className={`p-1 rounded hover:bg-accent transition-colors ${
              isAIActive || isAILoading ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            } disabled:opacity-50`}
            title="Ask AI"
          >
            {mounted ? <Sparkles className="w-3 h-3" /> : <div className="w-3 h-3 bg-muted rounded animate-pulse" />}
          </button>
        </>
      )}
    </div>
  )
}
