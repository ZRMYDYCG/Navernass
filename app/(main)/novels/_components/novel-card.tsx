import type { Novel } from '@/lib/supabase/sdk'
import Image from 'next/image'

interface NovelCardProps {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function NovelCard({ novel, onOpen, onContextMenu }: NovelCardProps) {
  return (
    <div
      className="group bg-white dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 overflow-hidden cursor-pointer"
      onClick={() => onOpen(novel)}
      onContextMenu={e => onContextMenu(e, novel)}
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
        {novel.cover
          ? (
              <Image src={novel.cover} alt={novel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            )
          : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl opacity-10 dark:opacity-5">📖</span>
              </div>
            )}
        
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 text-[11px] font-medium rounded backdrop-blur-md ${
              novel.status === 'published'
                ? 'bg-emerald-500/90 text-white'
                : 'bg-gray-900/60 text-gray-100'
            }`}
          >
            {novel.status === 'published' ? '已发布' : '草稿'}
          </span>
          {novel.category && (
            <span className="inline-flex items-center px-2 py-1 text-[11px] font-medium rounded bg-white/90 dark:bg-zinc-900/80 text-gray-700 dark:text-gray-300 backdrop-blur-md">
              {novel.category}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
            {novel.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {novel.description || '暂无简介'}
          </p>
        </div>

        {novel.tags && novel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {novel.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[11px] text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-700/50 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
            <span>{novel.chapter_count || 0} 章</span>
            <span>·</span>
            <span>{(novel.word_count / 1000).toFixed(1)}k 字</span>
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-600">
            {new Date(novel.updated_at).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  )
}
