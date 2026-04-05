'use client'

import type { Editor } from '@tiptap/react'
import { ChevronRight } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface AIMenuLeftProps {
  onPresetAction: (prompt: string) => void
  onEditAdjust?: () => void
  isLoading: boolean
  editor?: Editor | null
}

interface MenuItem {
  id: 'editAdjust' | 'rewriteTone' | 'organize' | 'writeFromSelection'
  hasSubmenu?: boolean
}

const editItems: MenuItem[] = [
  { id: 'editAdjust', hasSubmenu: true },
  { id: 'rewriteTone' },
  { id: 'organize' },
  { id: 'writeFromSelection' },
]

export function AIMenuLeft({ onPresetAction, onEditAdjust, isLoading, editor }: AIMenuLeftProps) {
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

    if (item.hasSubmenu) {
      if (item.id === 'editAdjust' && onEditAdjust) {
        onEditAdjust()
      }
      return
    }
    if (!isLoading) {
      onPresetAction(t(`tiptap.aiMenu.left.items.${item.id}.prompt`))
    }
  }

  return (
    <div className="bg-popover border border-border rounded shadow-xl w-[220px] overflow-hidden">
      <div className="py-0.5">
        {editItems.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleClick(item)}
            disabled={isLoading}
            className="w-full px-2.5 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent transition-colors flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{t(`tiptap.aiMenu.left.items.${item.id}.label`)}</span>
            {item.hasSubmenu && (
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
