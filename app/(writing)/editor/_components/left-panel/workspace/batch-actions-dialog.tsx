'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Check, Copy, Trash2, X } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()
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
    const action = mode === 'copy'
      ? t('editor.leftPanel.workspace.batchActions.mode.copy')
      : t('editor.leftPanel.workspace.batchActions.mode.delete')

    if (selectedIds.size === 0) {
      toast.error(t('editor.leftPanel.workspace.batchActions.pleaseSelectOne', { action }))
      return
    }

    try {
      setIsProcessing(true)
      await onConfirm(Array.from(selectedIds))
      toast.success(mode === 'copy'
        ? t('editor.leftPanel.workspace.batchActions.successCopy', { count: selectedIds.size })
        : t('editor.leftPanel.workspace.batchActions.successDelete', { count: selectedIds.size }))
      onOpenChange(false)
    } catch (error) {
      console.error('Batch action failed:', error)
      toast.error(mode === 'copy'
        ? t('editor.leftPanel.workspace.batchActions.failedCopy')
        : t('editor.leftPanel.workspace.batchActions.failedDelete'))
    } finally {
      setIsProcessing(false)
    }
  }

  const modeText = mode === 'copy'
    ? t('editor.leftPanel.workspace.batchActions.mode.copy')
    : t('editor.leftPanel.workspace.batchActions.mode.delete')
  const selectedCount = selectedIds.size

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                {mode === 'copy'
                  ? (
                      <Copy className="w-5 h-5 text-muted-foreground" />
                    )
                  : (
                      <Trash2 className="w-5 h-5 text-red-600" />
                    )}
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {t('editor.leftPanel.workspace.batchActions.titlePrefix')}
                  {modeText}
                </Dialog.Title>
                <span className="text-sm text-muted-foreground">
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
                  className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
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
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {selectedIds.size === chapters.length ? t('editor.leftPanel.workspace.batchActions.deselectAll') : t('editor.leftPanel.workspace.batchActions.selectAll')}
                </button>
                <span className="text-sm text-muted-foreground">
                  {t('editor.leftPanel.workspace.batchActions.selectedPrefix')}
                  {' '}
                  {selectedCount}
                  {' '}
                  {t('editor.leftPanel.workspace.batchActions.selectedSuffix')}
                </span>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1">
                {chapters.length === 0
                  ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">{t('editor.leftPanel.workspace.batchActions.empty')}</p>
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
                                ? 'border-primary bg-accent'
                                : 'border-border hover:border-border'
                            }`}
                          >
                            <div
                              className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-border'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-primary-foreground" />
                              )}
                            </div>
                            <span className="flex-1 text-sm text-foreground truncate">
                              {chapter.title}
                            </span>
                          </button>
                        )
                      })
                    )}
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 p-4 border-t border-border">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                  disabled={isProcessing}
                >
                  {t('common.cancel')}
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isProcessing || selectedCount === 0}
                className={`flex-1 ${
                  mode === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                {isProcessing ? t('editor.leftPanel.workspace.batchActions.processing', { action: modeText }) : t('editor.leftPanel.workspace.batchActions.confirm', { action: modeText })}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
