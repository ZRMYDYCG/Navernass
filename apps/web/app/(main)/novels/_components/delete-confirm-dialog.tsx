'use client'

import type { Novel } from '@/lib/supabase/sdk'
import * as Dialog from '@radix-ui/react-dialog'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

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
  const { t } = useI18n()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border p-6">
            <Dialog.Title className="text-xl font-semibold text-foreground mb-2">
              {t('novels.dialog.delete.title')}
            </Dialog.Title>

            <Dialog.Description className="text-muted-foreground mb-6">
              {t('novels.dialog.delete.descriptionPrefix')}
              <span className="font-medium text-foreground">
                {novel?.title}
              </span>
              {t('novels.dialog.delete.descriptionSuffix')}
            </Dialog.Description>

            <div className="flex gap-3">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-secondary-foreground hover:bg-accent"
                >
                  {t('novels.dialog.delete.cancel')}
                </Button>
              </Dialog.Close>
              <Button
                onClick={onConfirm}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                {t('novels.dialog.delete.confirm')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
