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
        <Spinner className="w-6 h-6 text-stone-400" />
        <span className="text-sm text-stone-400 font-serif">Loading...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-zinc-500 font-serif">
        <p className="text-lg mb-4 italic">Empty pages...</p>
        <Button
          onClick={onCreateNovel}
          className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-sans"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Writing
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-8">
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
