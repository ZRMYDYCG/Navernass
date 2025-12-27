import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CreateChapterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onTitleChange: (title: string) => void
  onConfirm: (volumeId?: string) => void
  isCreating: boolean
  volumes?: Array<{ id: string, title: string }>
  selectedVolumeId?: string
  onSelectedVolumeIdChange?: (id: string) => void
}

export function CreateChapterDialog({
  open,
  onOpenChange,
  title,
  onTitleChange,
  onConfirm,
  isCreating,
  volumes = [],
  selectedVolumeId,
  onSelectedVolumeIdChange,
}: CreateChapterDialogProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onConfirm(selectedVolumeId)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-4">
              创建新章节
            </Dialog.Title>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  章节标题
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => onTitleChange(e.target.value)}
                  placeholder="例如：第一章 新的开始"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>

              {volumes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    导入到卷（可选）
                  </label>
                  <Select
                    value={selectedVolumeId || '__none__'}
                    onValueChange={value => onSelectedVolumeIdChange?.(value === '__none__' ? '' : value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="不导入到卷（根目录）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">不导入到卷（根目录）</SelectItem>
                      {volumes.map(volume => (
                        <SelectItem key={volume.id} value={volume.id}>
                          {volume.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                  disabled={isCreating}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={() => onConfirm(selectedVolumeId)}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? '创建中...' : '创建'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
