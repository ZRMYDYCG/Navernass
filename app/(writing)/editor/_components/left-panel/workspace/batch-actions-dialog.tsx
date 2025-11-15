import * as Dialog from '@radix-ui/react-dialog'
import { Check, Copy, Trash2, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Chapter {
  id: string
  title: string
}

interface BatchActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapters: Chapter[]
  mode: 'copy' | 'delete'
  onConfirm: (selectedIds: string[]) => Promise<void>
}

export function BatchActionsDialog({
  open,
  onOpenChange,
  chapters,
  mode,
  onConfirm,
}: BatchActionsDialogProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(() => new Set())
  const [isProcessing, setIsProcessing] = React.useState(false)

  // 重置选择状态
  React.useEffect(() => {
    if (open) {
      setSelectedIds(() => new Set())
    }
  }, [open])

  // 切换选择
  const toggleSelect = (chapterId: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId)
      } else {
        newSet.add(chapterId)
      }
      return newSet
    })
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === chapters.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(chapters.map(ch => ch.id)))
    }
  }

  // 处理确认
  const handleConfirm = async () => {
    if (selectedIds.size === 0) {
      toast.error(`请至少选择一个章节${mode === 'copy' ? '进行复制' : '进行删除'}`)
      return
    }

    try {
      setIsProcessing(true)
      await onConfirm(Array.from(selectedIds))
      toast.success(
        mode === 'copy'
          ? `成功复制 ${selectedIds.size} 个章节`
          : `成功删除 ${selectedIds.size} 个章节`,
      )
      onOpenChange(false)
    } catch (error) {
      console.error(`${mode === 'copy' ? '复制' : '删除'}失败:`, error)
      toast.error(`${mode === 'copy' ? '复制' : '删除'}失败`)
    } finally {
      setIsProcessing(false)
    }
  }

  const modeText = mode === 'copy' ? '复制' : '删除'
  const selectedCount = selectedIds.size

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                {mode === 'copy'
                  ? (
                      <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    )
                  : (
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  批量
                  {modeText}
                </Dialog.Title>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  (
                  {selectedCount}
                  /
                  {chapters.length}
                  )
                </span>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
              <div className="mb-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  {selectedIds.size === chapters.length ? '取消全选' : '全选'}
                </button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  已选择
                  {' '}
                  {selectedCount}
                  {' '}
                  个章节
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1">
                {chapters.length === 0
                  ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">暂无章节</p>
                      </div>
                    )
                  : (
                      chapters.map((chapter) => {
                        const isSelected = selectedIds.has(chapter.id)
                        return (
                          <button
                            key={chapter.id}
                            type="button"
                            onClick={() => toggleSelect(chapter.id)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg border transition-colors text-left ${
                              isSelected
                                ? 'border-gray-900 dark:border-gray-100 bg-gray-50 dark:bg-gray-700'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }`}
                          >
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-gray-900 dark:border-gray-100 bg-gray-900 dark:bg-gray-100'
                                  : 'border-gray-300 dark:border-gray-500'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-white dark:text-gray-900" />
                              )}
                            </div>
                            <span className="flex-1 text-sm text-gray-900 dark:text-gray-100 truncate">
                              {chapter.title}
                            </span>
                          </button>
                        )
                      })
                    )}
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isProcessing}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing || selectedCount === 0}
                className={`flex-1 ${
                  mode === 'delete'
                    ? 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600'
                    : 'bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                }`}
              >
                {isProcessing ? `${modeText}中...` : `确认${modeText}`}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
