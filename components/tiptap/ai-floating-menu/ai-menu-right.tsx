'use client'

import type { Editor } from '@tiptap/react'

interface AIMenuRightProps {
  onPresetAction: (prompt: string) => void
  isLoading: boolean
  editor?: Editor | null
}

interface MenuItem {
  label: string
  prompt: string
  icon: string
}

const menuItems: MenuItem[] = [
  { label: '丰富内容', prompt: '丰富内容', icon: '☰' },
  { label: '精简内容', prompt: '精简内容', icon: '÷' },
  { label: '修改标点符号', prompt: '修改标点符号', icon: '"' },
  { label: '继续写', prompt: '继续写', icon: '→' },
]

export function AIMenuRight({ onPresetAction, isLoading, editor }: AIMenuRightProps) {
  const handleClick = (item: MenuItem) => {
    if (editor) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        editor.chain().focus().setTextSelection({ from, to }).run()
      } else {
        editor.chain().focus().run()
      }
    }

    if (!isLoading) {
      onPresetAction(item.prompt)
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded shadow-xl w-[160px] overflow-hidden">
      <div className="py-0.5">
        {menuItems.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-2.5 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm w-4 text-center">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
