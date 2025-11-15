import type { Novel } from '@/lib/supabase/sdk'
import { Edit, ExternalLink, Trash2 } from 'lucide-react'

interface NovelContextMenuProps {
  novel: Novel | null
  position: { x: number, y: number }
  onOpen: (novel: Novel) => void
  onEdit: (novel: Novel) => void
  onDelete: (novel: Novel) => void
  onClose: () => void
}

export function NovelContextMenu({
  novel,
  position,
  onOpen,
  onEdit,
  onDelete,
  onClose,
}: NovelContextMenuProps) {
  if (!novel) return null

  return (
    <div
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpen(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        打开
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onEdit(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
      >
        <Edit className="w-4 h-4" />
        编辑
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(novel)
          onClose()
        }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        删除
      </button>
    </div>
  )
}
