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
    if (editor) {
      const { from, to } = editor.state.selection
      if (from !== to) {
        editor.chain().focus().setTextSelection({ from, to }).run()
      } else {
        editor.chain().focus().run()
      }
    }

    if (item.hasSubmenu) {
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
    <div className="bg-popover border border-border rounded shadow-xl w-[220px] overflow-hidden">
      <div className="py-0.5">
        {editItems.map(item => (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{item.label}</span>
            {item.hasSubmenu && (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
