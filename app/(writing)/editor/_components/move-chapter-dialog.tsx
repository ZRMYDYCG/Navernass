import type { Volume } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'

interface MoveChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  chapterTitle: string
  volumes: Volume[]
  onConfirm: (volumeId: string | null) => void
  isMoving: boolean
}

export function MoveChapterDialog({
  open,
  onOpenChange,
  chapterTitle,
  volumes,
  onConfirm,
  isMoving,
}: MoveChapterDialogProps) {
  const handleConfirm = (volumeId: string | null) => {
    onConfirm(volumeId)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              将章节移入
            </Dialog.Title>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                选择章节 "
                {chapterTitle}
                " 的目标位置：
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleConfirm(null)}
                  type="button"
                  disabled={isMoving}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">根目录</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">将章节放置在根目录下</div>
                </button>

                {volumes.map(volume => (
                  <button
                    key={volume.id}
                    type="button"
                    onClick={() => handleConfirm(volume.id)}
                    disabled={isMoving}
                    className="w-full text-left px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100">{volume.title}</div>
                    {volume.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{volume.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isMoving}
                >
                  取消
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
