'use client'

import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'

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
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { t } = useI18n()
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-4xl w-[calc(100%-2rem)]",
        isDark 
          ? "bg-zinc-900 text-white border-zinc-800 shadow-[0_40px_120px_rgba(0,0,0,0.6)]" 
          : "bg-white text-gray-900 border-gray-200 shadow-[0_40px_120px_rgba(0,0,0,0.1)]"
      )}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-wide">{t('chat.share.preview')}</DialogTitle>
        </DialogHeader>

        <div className={cn(
          "max-h-[70vh] overflow-auto rounded-2xl p-4",
          isDark ? "bg-zinc-950" : "bg-gray-50"
        )}>
          {imageUrl
            ? (
                <img
                  src={imageUrl}
                  alt={t('chat.share.previewAlt')}
                  className={cn(
                    "w-full rounded-[28px] border",
                    isDark 
                      ? "shadow-[0_30px_80px_rgba(0,0,0,0.5)] border-zinc-800" 
                      : "shadow-[0_30px_80px_rgba(0,0,0,0.15)] border-gray-200"
                  )}
                />
              )
            : (
                <div className={cn(
                  "h-[360px] flex items-center justify-center text-sm rounded-[28px] border border-dashed",
                  isDark 
                    ? "text-gray-400 border-zinc-700" 
                    : "text-gray-400 border-gray-300"
                )}>
                  {isLoading ? t('chat.share.imageGenerating') : t('chat.share.nothingToPreview')}
                </div>
              )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            className={cn(
              isDark 
                ? "text-gray-400 hover:text-gray-100" 
                : "text-gray-600 hover:text-gray-900"
            )}
            onClick={() => onOpenChange(false)}
          >
            {t('chat.share.close')}
          </Button>
          <Button
            onClick={onDownload}
            disabled={!imageUrl}
            className={cn(
              isDark 
                ? "bg-zinc-100 text-zinc-900 hover:bg-white" 
                : "bg-gray-900 text-white hover:bg-gray-800"
            )}
          >
            {t('chat.share.download')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
