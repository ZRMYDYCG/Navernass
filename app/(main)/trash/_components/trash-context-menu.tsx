import type { Novel } from '@/lib/supabase/sdk'
import { RotateCcw, Trash2 } from 'lucide-react'

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
  return (
    <div
      className="fixed bg-white dark:bg-zinc-800/95 backdrop-blur-sm rounded-md shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[140px]"
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
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        恢复
      </button>
      <button
        type="button"
        onClick={() => {
          onPermanentDelete(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        永久删除
      </button>
    </div>
  )
}
