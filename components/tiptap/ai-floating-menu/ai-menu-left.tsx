'use client'

import type { Editor } from '@tiptap/react'
import { ChevronRight } from 'lucide-react'

interface AIMenuLeftProps {
  onPresetAction: (prompt: string) => void
  onEditAdjust?: () => void
  isLoading: boolean
  editor?: Editor | null
}

interface MenuItem {
  label: string
  prompt: string
  icon?: string
  hasSubmenu?: boolean
}

const editItems: MenuItem[] = [
  { label: '编辑调整选中内容', prompt: '编辑调整', hasSubmenu: true },
  { label: '改写口吻', prompt: '改写口吻' },
  { label: '整理选区内容', prompt: '整理内容' },
  { label: '根据选区内容写', prompt: '根据内容写' },
]

export function AIMenuLeft({ onPresetAction, onEditAdjust, isLoading, editor }: AIMenuLeftProps) {
  const handleClick = (item: MenuItem) => {
    // 保持编辑器的焦点和选中状态
    if (editor) {
      const { from, to } = editor.state.selection
      // 如果有选中文本，保持选中状态
      if (from !== to) {
        editor.chain().focus().setTextSelection({ from, to }).run()
      } else {
        editor.chain().focus().run()
      }
    }

    if (item.hasSubmenu) {
      // 如果是"编辑调整选中内容"，显示右侧菜单
      if (item.label === '编辑调整选中内容' && onEditAdjust) {
        onEditAdjust()
      }
      return
    }
    if (!isLoading) {
      onPresetAction(item.prompt)
    }
  }

  return (
    <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl w-[280px] overflow-hidden">
      {/* 编辑选项 */}
      <div className="py-1">
        {editItems.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{item.label}</span>
            {item.hasSubmenu && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
