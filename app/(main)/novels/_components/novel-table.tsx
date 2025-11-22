import type { Novel } from '@/lib/supabase/sdk'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Edit2, MoreVertical, Play, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface NovelTableProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel: (novel: Novel) => void
  onDeleteNovel: (novel: Novel) => void
  onContextMenu: (e: React.MouseEvent, novel: Novel) => void
}

export function NovelTable({
  novels,
  loading,
  onOpenNovel,
  onEditNovel,
  onDeleteNovel,
  onContextMenu,
}: NovelTableProps) {
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
        <p className="text-lg mb-2">还没有小说</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">点击右上角创建你的第一部小说</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 -mx-2 sm:mx-0">
      <table className="w-full border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[200px]">
              标题
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[250px]">
              描述
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[80px]">
              状态
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[70px]">
              章节
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[90px]">
              字数
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[120px]">
              更新时间
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap w-20">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-100 dark:divide-gray-800">
          {novels.map((novel, index) => (
            <tr
              key={novel.id}
              onContextMenu={e => onContextMenu(e, novel)}
              className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group ${
                index % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/30 dark:bg-zinc-800/20'
              }`}
            >
              {/* 标题 */}
              <td className="py-4 px-4">
                <button
                  type="button"
                  onClick={() => onOpenNovel(novel)}
                  className="text-left font-medium text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-ellipsis overflow-hidden block max-w-[200px]"
                  title={novel.title}
                >
                  {novel.title}
                </button>
              </td>

              {/* 描述 */}
              <td className="py-4 px-4">
                <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap text-ellipsis overflow-hidden block max-w-[250px]" title={novel.description || ''}>
                  {novel.description || '-'}
                </span>
              </td>

              {/* 状态 */}
              <td className="py-4 px-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                    novel.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-400'
                  }`}
                >
                  {novel.status === 'published' ? '已发布' : '草稿'}
                </span>
              </td>

              {/* 章节数 */}
              <td className="py-4 px-4 text-right">
                <span className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {novel.chapter_count || 0}
                </span>
              </td>

              {/* 字数 */}
              <td className="py-4 px-4 text-right">
                <span className="text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {(novel.word_count || 0).toLocaleString()}
                </span>
              </td>

              {/* 更新时间 */}
              <td className="py-4 px-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDistanceToNow(new Date(novel.updated_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </td>

              {/* 操作 */}
              <td className="py-4 px-4">
                <div className="flex items-center justify-center gap-1">
                  {/* 快速操作按钮 */}
                  <button
                    type="button"
                    onClick={() => onOpenNovel(novel)}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="开始创作"
                  >
                    <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>

                  {/* 更多操作菜单 */}
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50 min-w-[160px]"
                        sideOffset={5}
                        align="end"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenNovel(novel)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          开始创作
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditNovel(novel)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          编辑信息
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteNovel(novel)
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
