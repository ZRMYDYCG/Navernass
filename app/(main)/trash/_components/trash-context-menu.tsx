'use client'

import type { Novel } from '@/lib/supabase/sdk'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useI18n } from '@/hooks/use-i18n'

interface TrashContextMenuProps {
  novel: Novel
  position: { x: number, y: number }
  onRestore: (novel: Novel) => void
  onPermanentDelete: (novel: Novel) => void
  onClose: () => void
}

export function TrashContextMenu({
  novel,
  position,
  onRestore,
  onPermanentDelete,
  onClose,
}: TrashContextMenuProps) {
  const { t } = useI18n()

  return (
    <div
      className="fixed bg-card/95 backdrop-blur-sm rounded-md shadow-lg border border-border p-1 z-50 min-w-[140px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={e => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => {
          onRestore(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent rounded transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        {t('trash.actions.restore')}
      </button>
      <button
        type="button"
        onClick={() => {
          onPermanentDelete(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent rounded transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        {t('trash.actions.permanentDelete')}
      </button>
    </div>
  )
}
