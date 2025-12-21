import type { Novel } from '@/lib/supabase/sdk'
import * as Popover from '@radix-ui/react-popover'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Edit2, MoreHorizontal, Play, Trash2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface NovelTableProps {
  novels: Novel[]
  loading: boolean
  onOpenNovel: (novel: Novel) => void
  onEditNovel: (novel: Novel) => void
  onDeleteNovel: (novel: Novel) => void
  onContextMenu?: (e: React.MouseEvent, novel: Novel) => void
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
        <span className="text-sm text-muted-foreground">加载中...</span>
      </div>
    )
  }

  if (novels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-lg mb-2">还没有小说</p>
        <p className="text-sm text-muted-foreground">点击右上角创建你的第一部小说</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border -mx-2 sm:mx-0">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow className="bg-secondary hover:bg-secondary">
            <TableHead className="min-w-[200px] py-3 px-4 font-semibold text-center">标题</TableHead>
            <TableHead className="min-w-[250px] py-3 px-4 font-semibold text-center">描述</TableHead>
            <TableHead className="min-w-[80px] py-3 px-4 font-semibold text-center">状态</TableHead>
            <TableHead className="min-w-[70px] py-3 px-4 font-semibold text-center">章节</TableHead>
            <TableHead className="min-w-[90px] py-3 px-4 font-semibold text-center">字数</TableHead>
            <TableHead className="min-w-[120px] py-3 px-4 font-semibold text-center">更新时间</TableHead>
            <TableHead className="w-20 py-3 px-4 font-semibold text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {novels.map((novel, index) => (
            <TableRow
              key={novel.id}
              onContextMenu={onContextMenu ? e => onContextMenu(e, novel) : undefined}
              className={`group ${
                index % 2 === 0 ? 'bg-background' : 'bg-muted'
              }`}
            >
              <TableCell className="py-4 px-4 text-center">
                <button
                  type="button"
                  onClick={() => onOpenNovel(novel)}
                  className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-ellipsis overflow-hidden block max-w-[200px] mx-auto"
                  title={novel.title}
                >
                  {novel.title}
                </button>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <span className="text-sm text-muted-foreground text-ellipsis overflow-hidden block max-w-[250px] mx-auto" title={novel.description || ''}>
                  {novel.description || '-'}
                </span>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    novel.status === 'published'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {novel.status === 'published' ? '已发布' : '草稿'}
                </span>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <span className="text-sm">
                  {novel.chapter_count || 0}
                </span>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <span className="text-sm">
                  {(novel.word_count || 0).toLocaleString()}
                </span>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(novel.updated_at), {
                    addSuffix: true,
                    locale: zhCN,
                  })}
                </span>
              </TableCell>

              <TableCell className="py-4 px-4 text-center">
                <div className="flex items-center justify-center">
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="p-1.5 cursor-pointer rounded hover:bg-accent transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal>
                      <Popover.Content
                        className="bg-card rounded-lg shadow-lg border border-border p-1 z-50 min-w-[160px]"
                        sideOffset={5}
                        align="end"
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onOpenNovel(novel)
                          }}
                          className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
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
                          className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-md transition-colors"
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
                          className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          删除
                        </button>
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
