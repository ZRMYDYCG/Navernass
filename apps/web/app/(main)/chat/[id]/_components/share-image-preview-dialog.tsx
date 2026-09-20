'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'

interface ShareImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string | null
  isLoading: boolean
  onDownload: () => void
}

export function ShareImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  isLoading,
  onDownload,
}: ShareImagePreviewDialogProps) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle>{t('chat.share.preview')}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto rounded-sm border border-border/60 bg-muted/30 p-4">
          {imageUrl
            ? (
                <img
                  src={imageUrl}
                  alt={t('chat.share.previewAlt')}
                  className="w-full rounded-sm border border-border shadow-paper-md"
                />
              )
            : (
                <div className="flex h-[360px] items-center justify-center rounded-sm border border-dashed border-border text-sm text-muted-foreground">
                  {isLoading ? t('chat.share.imageGenerating') : t('chat.share.nothingToPreview')}
                </div>
              )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t('chat.share.close')}
          </Button>
          <Button onClick={onDownload} disabled={!imageUrl}>
            {t('chat.share.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
