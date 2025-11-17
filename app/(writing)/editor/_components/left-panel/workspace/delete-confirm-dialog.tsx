import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  onConfirm: () => void
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = '确认删除',
  description = '确定要删除吗？此操作无法撤销。',
  onConfirm,
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {title}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-500 dark:text-gray-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600"
              >
                确认删除
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
