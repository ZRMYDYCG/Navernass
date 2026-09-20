'use client'

import { Copy, Image as ImageIcon, Link2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'

interface ShareActionBarProps {
  selectedCount: number
  onCancel: () => void
  onCopyText: () => void
  onCopyLink: () => void
  onGenerateImage: () => void
  isGeneratingImage: boolean
}

export function ShareActionBar({
  selectedCount,
  onCancel,
  onCopyText,
  onCopyLink,
  onGenerateImage,
  isGeneratingImage,
}: ShareActionBarProps) {
  const { t } = useI18n()

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {t('chat.share.selectedPrefix')}
            {' '}
            {selectedCount}
            {' '}
            {t('chat.share.selectedSuffix')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
            <span>{t('chat.share.cancel')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyText}
          >
            <Copy className="w-4 h-4" />
            <span>{t('chat.share.copyText')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onCopyLink}
          >
            <Link2 className="w-4 h-4" />
            <span>{t('chat.share.copyLink')}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="h-8 px-3"
            onClick={onGenerateImage}
            disabled={isGeneratingImage || selectedCount === 0}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isGeneratingImage ? t('chat.share.generating') : t('chat.share.generateImage')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
