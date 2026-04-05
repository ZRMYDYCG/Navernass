'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, X } from 'lucide-react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

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
  title,
  description,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const { t } = useI18n()
  const dialogTitle = title ?? t('editor.leftPanel.workspace.deleteConfirm.title')
  const dialogDescription = description ?? t('editor.leftPanel.workspace.deleteConfirm.description')

  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-card rounded-lg shadow-lg border border-border">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <Dialog.Title className="text-lg font-semibold text-foreground mb-1">
                    {dialogTitle}
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">
                    {dialogDescription}
                  </Dialog.Description>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="p-1 hover:bg-accent rounded transition-colors text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t border-border">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 bg-secondary text-foreground hover:bg-accent"
                >
                  {t('common.cancel')}
                </Button>
              </Dialog.Close>
              <Button
                type="button"
                onClick={handleConfirm}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                {t('editor.leftPanel.workspace.deleteConfirm.confirm')}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
