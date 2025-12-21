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
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
              确认删除
            </Dialog.Title>

            <Dialog.Description className="text-muted-foreground mb-6">
              确定要将小说《
              <span className="font-medium text-foreground">
                {novel?.title}
              </span>
              》移到回收站吗？
            </Dialog.Description>

            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
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
