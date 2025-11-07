import type { Novel } from '@/lib/supabase/sdk'
import { Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { TrashCard } from './trash-card'

interface TrashListProps {
  novels: Novel[]
  loading: boolean
  selectedIds: Set<string>
  onToggleSelect: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function TrashList({
  novels,
  loading,
  selectedIds,
  onToggleSelect,
  onContextMenu,
}: TrashListProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner className="w-8 h-8" />
        <span className="text-sm text-gray-500 dark:text-gray-400">加载中...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
        <Trash2 className="w-16 h-16 mb-4 opacity-40" />
        <p className="text-lg mb-2">回收站是空的</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">归档的小说会保留在这里</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {novels.map(novel => (
        <TrashCard
          key={novel.id}
          novel={novel}
          selected={selectedIds.has(novel.id)}
          onToggleSelect={onToggleSelect}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}
