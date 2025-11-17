'use client'

import type { Editor } from '@tiptap/react'
import { Bold, Italic, Sparkles, Underline as UnderlineIcon } from 'lucide-react'
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
    <div className="flex items-center gap-0.5 p-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('bold') ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
        }`}
        title="加粗"
      >
        <Bold className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('italic') ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
        }`}
        title="斜体"
      >
        <Italic className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
          editor.isActive('underline') ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
        }`}
        title="下划线"
      >
        <UnderlineIcon className="w-3 h-3" />
      </button>

      {onAIClick && (
        <>
          <div className="w-px h-4 bg-gray-300 dark:bg-zinc-600 mx-0.5" />
          <button
            type="button"
            onMouseDown={(e) => {
              // 阻止默认行为，防止失去焦点
              e.preventDefault()
              // 保存当前选中状态（在点击前保存，因为点击可能会改变选中状态）
              const { from, to } = editor.state.selection
              const savedSelection = from !== to ? { from, to } : null

              // 立即恢复选中状态和焦点
              if (savedSelection) {
                // 使用 setTimeout 0 确保在浏览器处理点击事件后恢复
                setTimeout(() => {
                  editor.chain().focus().setTextSelection({ from: savedSelection.from, to: savedSelection.to }).run()
                  // 然后再触发 AI 点击
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
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isAIActive || isAILoading ? 'bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
            } disabled:opacity-50`}
            title="Ask AI"
          >
            {mounted ? <Sparkles className="w-3 h-3" /> : <div className="w-3 h-3 bg-gray-300 dark:bg-zinc-600 rounded animate-pulse" />}
          </button>
        </>
      )}
    </div>
  )
}
