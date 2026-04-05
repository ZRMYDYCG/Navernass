'use client'

import type { Editor } from '@tiptap/react'
import { useI18n } from '@/hooks/use-i18n'

interface AIMenuRightProps {
  onPresetAction: (prompt: string) => void
  isLoading: boolean
  editor?: Editor | null
}

interface MenuItem {
  id: 'enrich' | 'shorten' | 'punctuation' | 'continue'
  icon: string
}

const menuItems: MenuItem[] = [
  { id: 'enrich', icon: '☰' },
  { id: 'shorten', icon: '÷' },
  { id: 'punctuation', icon: '"' },
  { id: 'continue', icon: '→' },
]

export function AIMenuRight({ onPresetAction, isLoading, editor }: AIMenuRightProps) {
  const { t } = useI18n()

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
      onPresetAction(t(`tiptap.aiMenu.right.items.${item.id}.prompt`))
    }
  }

  return (
    <div className="bg-popover border border-border rounded shadow-xl w-[160px] overflow-hidden">
      <div className="py-0.5">
        {menuItems.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-sm w-4 text-center">{item.icon}</span>
            <span>{t(`tiptap.aiMenu.right.items.${item.id}.label`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
