import type { Novel } from '@/lib/supabase/sdk'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface NovelCardProps {
  novel: Novel
  onOpen: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function NovelCard({ novel, onOpen, onContextMenu }: NovelCardProps) {
  return (
    <div
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow border border-gray-100 dark:border-gray-700 relative cursor-context-menu"
      onContextMenu={e => onContextMenu(e, novel)}
    >
      {/* 封面图片 */}
      <div className="relative h-[280px] overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20 dark:from-purple-500/10 dark:to-pink-500/10">
        {novel.cover
          ? (
              <Image src={novel.cover} alt={novel.title} fill className="object-cover" />
            )
          : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-20">📖</span>
              </div>
            )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute top-2 left-2">
          <span
            className={`inline-block px-2.5 py-1 backdrop-blur-sm text-xs font-medium rounded-full ${
              novel.status === 'published'
                ? 'bg-green-500/90 text-white'
                : 'bg-gray-500/90 text-white'
            }`}
          >
            {novel.status === 'published' ? '已发布' : '草稿'}
          </span>
        </div>
        {novel.category && (
          <div className="absolute top-2 right-2">
            <span className="inline-block px-2.5 py-1 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-200 rounded-full">
              {novel.category}
            </span>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 标题 */}
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
          {novel.title}
        </h3>

        {/* 描述 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {novel.description || '暂无简介'}
        </p>

        {/* 标签 */}
        {novel.tags && novel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {novel.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-700 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>
              {novel.chapter_count || 0}
              {' '}
              章
            </span>
            <span>·</span>
            <span>
              {(novel.word_count / 1000).toFixed(1)}
              k 字
            </span>
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(novel.updated_at).toLocaleDateString()}
          </span>
        </div>

        {/* 开始创作按钮 */}
        <Button
          className="w-full bg-black dark:bg-zinc-700 text-white h-8 text-sm hover:bg-gray-800 dark:hover:bg-gray-600"
          onClick={() => onOpen(novel)}
        >
          开始创作
        </Button>
      </div>
    </div>
  )
}
