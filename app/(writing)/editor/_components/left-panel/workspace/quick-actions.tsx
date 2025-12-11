import { Copy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as Tooltip from '@radix-ui/react-tooltip'
import { BatchActionsDialog } from './batch-actions-dialog'

interface Chapter {
  id: string
  title: string
}

const EMPTY_CHAPTERS: Chapter[] = []

interface QuickActionsProps {
  onCreateChapter?: () => void
  onBatchDelete?: () => void
  onBatchCopy?: () => void
  chapters?: Chapter[]
  novelId?: string
  onChaptersChanged?: () => void
  chaptersCount?: number
}

export function QuickActions({
  onCreateChapter,
  onBatchDelete,
  onBatchCopy,
  chapters = EMPTY_CHAPTERS,
  novelId,
  onChaptersChanged,
  chaptersCount = 0,
}: QuickActionsProps) {
  const [isProcessing] = useState(false)
  const [batchCopyOpen, setBatchCopyOpen] = useState(false)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)

  const handleCreateChapter = () => {
    if (onCreateChapter) {
      onCreateChapter()
    } else {
      toast.info('请从章节列表创建新章节')
    }
  }

  const handleBatchDelete = async () => {
    if (chaptersCount === 0) {
      toast.error('没有可删除的章节')
      return
    }
    if (onBatchDelete) {
      onBatchDelete()
    } else if (chapters.length > 0 && novelId) {
      setBatchDeleteOpen(true)
    } else {
      toast.info('批量删除功能开发中')
    }
  }

  const handleBatchCopy = async () => {
    if (chaptersCount === 0) {
      toast.error('没有可复制的章节')
      return
    }
    if (onBatchCopy) {
      onBatchCopy()
    } else if (chapters.length > 0 && novelId) {
      setBatchCopyOpen(true)
    } else {
      toast.info('批量复制功能开发中')
    }
  }

  // 批量复制处理
  const handleBatchCopyConfirm = async (selectedIds: string[]) => {
    if (!novelId) return

    const { chaptersApi } = await import('@/lib/supabase/sdk')

    try {
      // 获取所有章节
      const allChapters = await chaptersApi.getByNovelId(novelId)
      const selectedChapters = allChapters.filter(ch => selectedIds.includes(ch.id))

      // 获取最大 order_index
      const maxOrderIndex = allChapters.length > 0
        ? Math.max(...allChapters.map(c => c.order_index))
        : -1

      let currentOrderIndex = maxOrderIndex + 1

      // 复制每个选中的章节
      for (const chapter of selectedChapters) {
        await chaptersApi.create({
          novel_id: novelId,
          title: `${chapter.title} (副本)`,
          content: chapter.content || '',
          order_index: currentOrderIndex,
          volume_id: chapter.volume_id || undefined,
        })
        currentOrderIndex++
      }

      if (onChaptersChanged) {
        onChaptersChanged()
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('批量复制失败:', error)
      throw error
    }
  }

  // 批量删除处理
  const handleBatchDeleteConfirm = async (selectedIds: string[]) => {
    if (!novelId) return

    const { chaptersApi } = await import('@/lib/supabase/sdk')

    try {
      // 删除每个选中的章节
      for (const chapterId of selectedIds) {
        await chaptersApi.delete(chapterId)
      }

      if (onChaptersChanged) {
        onChaptersChanged()
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      throw error
    }
  }

  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-stone-600 dark:text-stone-300 px-1 font-serif">
        快速操作
      </span>
      <div className="flex gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleCreateChapter}
              disabled={isProcessing}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              新建章节
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleBatchCopy}
              disabled={isProcessing || chaptersCount === 0}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              批量复制
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={isProcessing || chaptersCount === 0}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-700/50 rounded-md transition-all text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:shadow-sm hover:text-rose-700 dark:hover:text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-stone-800 dark:bg-zinc-700 text-stone-50 text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              批量删除
              <Tooltip.Arrow className="fill-stone-800 dark:fill-zinc-700" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      {/* 批量复制对话框 */}
      {chapters.length > 0 && novelId && (
        <BatchActionsDialog
          open={batchCopyOpen}
          onOpenChange={setBatchCopyOpen}
          chapters={chapters}
          mode="copy"
          onConfirm={handleBatchCopyConfirm}
        />
      )}

      {/* 批量删除对话框 */}
      {chapters.length > 0 && novelId && (
        <BatchActionsDialog
          open={batchDeleteOpen}
          onOpenChange={setBatchDeleteOpen}
          chapters={chapters}
          mode="delete"
          onConfirm={handleBatchDeleteConfirm}
        />
      )}
    </div>
  )
}
