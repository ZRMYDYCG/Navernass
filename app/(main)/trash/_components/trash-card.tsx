import type { Novel } from '@/lib/supabase/sdk'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { BookOpen, Check } from 'lucide-react'

interface TrashCardProps {
  novel: Novel
  selected: boolean
  onToggleSelect: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function TrashCard({ novel, selected, onToggleSelect, onContextMenu }: TrashCardProps) {
  return (
    <div
      onContextMenu={e => onContextMenu(e, novel)}
      onClick={() => onToggleSelect(novel)}
      className={`group relative bg-white dark:bg-zinc-800 rounded-lg border transition-all cursor-pointer ${
        selected
          ? 'border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20 dark:ring-blue-400/20'
          : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
      }`}
    >
      {/* 选择指示器 */}
      <div
        className={`absolute top-3 right-3 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          selected
            ? 'bg-blue-500 border-blue-500 dark:bg-blue-400 dark:border-blue-400'
            : 'bg-white dark:bg-zinc-700 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
        }`}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>

      {/* 图标和类型 */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 shrink-0">
          <BookOpen className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {novel.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">小说</p>
        </div>
      </div>

      {/* 描述 */}
      {novel.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 px-4 pb-3">
          {novel.description}
        </p>
      )}

      {/* 统计信息 */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 px-4 pb-3">
        <span>
          {novel.word_count.toLocaleString()}
          {' '}
          字
        </span>
        <span>
          {novel.chapter_count}
          {' '}
          章节
        </span>
      </div>

      {/* 时间信息 */}
      <p className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-4">
        归档于
        {' '}
        {formatDistanceToNow(new Date(novel.updated_at), {
          addSuffix: true,
          locale: zhCN,
        })}
      </p>
    </div>
  )
}
