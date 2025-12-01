import type { Novel } from '@/lib/supabase/sdk'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from './empty-state'
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
        <Spinner className="w-6 h-6 text-stone-400" />
        <span className="text-sm text-stone-400 font-serif">加载中...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
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
