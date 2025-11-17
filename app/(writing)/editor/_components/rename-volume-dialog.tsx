import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'

interface RenameVolumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onTitleChange: (title: string) => void
  onConfirm: () => void
  isUpdating: boolean
}

export function RenameVolumeDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onConfirm,
  isUpdating,
}: RenameVolumeDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onConfirm()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              重命名卷
            </Dialog.Title>

            <div className="space-y-4">
              {/* 标题输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  卷标题
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => onTitleChange(e.target.value)}
                  placeholder="例如：第一卷、上部、序章"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-zinc-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                  disabled={isUpdating}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                disabled={isUpdating || !title.trim()}
              >
                {isUpdating ? '更新中...' : '确定'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
