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
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
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
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        恢复
      </button>
      <button
        type="button"
        onClick={() => {
          onPermanentDelete(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        永久删除
      </button>
    </div>
  )
}
