'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

interface CreateVolumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (description: string) => void
  onConfirm: () => void
  isCreating: boolean
}

export function CreateVolumeDialog({
  open,
  onOpenChange,
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onConfirm,
  isCreating,
}: CreateVolumeDialogProps) {
  const { t } = useI18n()

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
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-4">
              {t('editor.createVolumeDialog.title')}
            </Dialog.Title>

            <div className="space-y-4">
              {/* 标题输入 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('editor.volumes.titleLabel')}
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => onTitleChange(e.target.value)}
                  placeholder={t('editor.volumes.titlePlaceholder')}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* 描述输入 */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('editor.createVolumeDialog.descriptionLabel')}
                </label>
                <textarea
                  value={description}
                  onChange={e => onDescriptionChange(e.target.value)}
                  placeholder={t('editor.createVolumeDialog.descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                  disabled={isCreating}
                >
                  {t('common.cancel')}
                </Button>
              </Dialog.Close>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? t('editor.createVolumeDialog.creating') : t('editor.createVolumeDialog.create')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
