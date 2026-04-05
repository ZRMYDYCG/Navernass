'use client'

import type { Volume } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()
  const handleConfirm = (volumeId: string | null) => {
    onConfirm(volumeId)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-4">
              {t('editor.moveChapterDialog.title')}
            </Dialog.Title>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('editor.moveChapterDialog.description', { title: chapterTitle })}
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleConfirm(null)}
                  type="button"
                  disabled={isMoving}
                  className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="font-medium text-foreground">{t('editor.moveChapterDialog.root.title')}</div>
                  <div className="text-sm text-muted-foreground">{t('editor.moveChapterDialog.root.description')}</div>
                </button>

                {volumes.map(volume => (
                  <button
                    key={volume.id}
                    type="button"
                    onClick={() => handleConfirm(volume.id)}
                    disabled={isMoving}
                    className="w-full text-left px-4 py-3 rounded-lg border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-foreground">{volume.title}</div>
                    {volume.description && (
                      <div className="text-sm text-muted-foreground">{volume.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                  disabled={isMoving}
                >
                  {t('common.cancel')}
                </Button>
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
