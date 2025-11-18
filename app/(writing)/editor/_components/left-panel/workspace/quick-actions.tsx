import { Copy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
    <div className="space-y-1.5">
      <h3 className="text-xs font-medium text-zinc-700 dark:text-zinc-300 px-1">
        快速操作
      </h3>
      <div className="space-y-1">
        <Button
          type="button"
          onClick={handleCreateChapter}
          disabled={isProcessing}
          className="w-full justify-start h-7 text-xs bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600"
        >
          <Plus className="w-3 h-3 mr-1.5" />
          新建章节
        </Button>

        <div className="grid grid-cols-2 gap-1">
          <Button
            type="button"
            onClick={handleBatchCopy}
            disabled={isProcessing || chaptersCount === 0}
            className="h-7 text-xs bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600"
          >
            <Copy className="w-3 h-3 mr-1" />
            批量复制
          </Button>

          <Button
            type="button"
            onClick={handleBatchDelete}
            disabled={isProcessing || chaptersCount === 0}
            className="h-7 text-xs bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-600 border border-zinc-200 dark:border-zinc-600 hover:text-red-700 dark:hover:text-red-300"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            批量删除
          </Button>
        </div>
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
