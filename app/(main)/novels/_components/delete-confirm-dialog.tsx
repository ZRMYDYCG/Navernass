import type { Novel } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DeleteConfirmDialogProps {
  open: boolean
  novel: Novel | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function DeleteConfirmDialog({
  open,
  novel,
  onOpenChange,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              确认删除
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 dark:text-gray-400 mb-6">
              确定要将小说《
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {novel?.title}
              </span>
              》移到回收站吗？
            </Dialog.Description>

            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-800"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
