import type { Novel } from '@/lib/supabase/sdk'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { NovelCard } from './novel-card'

interface NovelListProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
  onCreateNovel: () => void
}

export function NovelList({
  novels,
  loading,
  onOpenNovel,
  onContextMenu,
  onCreateNovel,
}: NovelListProps) {
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
        <p className="text-lg mb-4">还没有小说</p>
        <Button
          onClick={onCreateNovel}
          className="bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700"
        >
          <Plus className="w-4 h-4" />
          创建第一部小说
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {novels.map(novel => (
        <NovelCard
          key={novel.id}
          novel={novel}
          onOpen={onOpenNovel}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  )
}
