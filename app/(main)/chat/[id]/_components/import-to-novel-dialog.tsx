'use client'

import type { Novel, Volume } from '@/lib/supabase/sdk/types'
import { FileText, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/hooks/use-i18n'
import { chaptersApi, novelsApi, volumesApi } from '@/lib/supabase/sdk'

interface ImportToNovelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  content: string
  onSuccess?: () => void
}

export function ImportToNovelDialog({
  open,
  onOpenChange,
  content,
  onSuccess,
}: ImportToNovelDialogProps) {
  const { t } = useI18n()
  const [novels, setNovels] = useState<Novel[]>([])
  const [volumes, setVolumes] = useState<Volume[]>([])
  const [selectedNovelId, setSelectedNovelId] = useState<string>('')
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNovels, setIsLoadingNovels] = useState(false)
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(false)

  const handleImport = async () => {
    if (!selectedNovelId) {
      toast.error(t('chat.importToNovel.messages.selectNovelRequired'))
      return
    }

    if (!chapterTitle.trim()) {
      toast.error(t('chat.importToNovel.messages.chapterTitleRequired'))
      return
    }

    try {
      setIsLoading(true)

      const chapterData = {
        novel_id: selectedNovelId,
        title: chapterTitle.trim(),
        content: content || '',
        order_index: 1,
        ...(selectedVolumeId && { volume_id: selectedVolumeId }),
      }

      await chaptersApi.create(chapterData)
      toast.success(t('chat.importToNovel.messages.chapterCreated'))

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }

      setSelectedNovelId('')
      setSelectedVolumeId('')
      setChapterTitle('')
    } catch (error) {
      console.error('Failed to import:', error)
      let errorMessage = t('chat.importToNovel.messages.unknownError')

      if (error instanceof Error) {
        errorMessage = error.message
        if ('details' in error && error.details) {
          console.error('Error details:', error.details)
        }
        if ('code' in error && error.code) {
          console.error('Error code:', error.code)
        }
      } else if (typeof error === 'object' && error !== null) {
        if ('message' in error) {
          errorMessage = String(error.message)
        }
      }

      toast.error(t('chat.importToNovel.messages.createFailed', { error: errorMessage }))
    } finally {
      setIsLoading(false)
    }
  }

  // 加载小说列表
  useEffect(() => {
    if (!open) return

    const loadNovels = async () => {
      try {
        setIsLoadingNovels(true)
        const result = await novelsApi.getList({ page: 1, pageSize: 100 })
        setNovels(result.data || [])
      } catch (error) {
        console.error('Failed to load novels:', error)
        toast.error(t('chat.importToNovel.messages.loadNovelsFailed'))
      } finally {
        setIsLoadingNovels(false)
      }
    }

    loadNovels()
  }, [open])

  useEffect(() => {
    if (!selectedNovelId) {
      setVolumes([])
      setSelectedVolumeId('')
      return
    }

    const loadVolumes = async () => {
      try {
        setIsLoadingVolumes(true)
        const volumesList = await volumesApi.getByNovelId(selectedNovelId)
        setVolumes(volumesList)
      } catch (error) {
        console.error('Failed to load volumes:', error)
        toast.error(t('chat.importToNovel.messages.loadVolumesFailed'))
      } finally {
        setIsLoadingVolumes(false)
      }
    }

    loadVolumes()
  }, [selectedNovelId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-popover border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {t('chat.importToNovel.title')}
          </DialogTitle>
          <DialogDescription>
            {t('chat.importToNovel.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('chat.importToNovel.fields.novel')}</label>
            <Select
              value={selectedNovelId}
              onValueChange={setSelectedNovelId}
              disabled={isLoadingNovels}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingNovels ? t('chat.importToNovel.placeholders.loading') : t('chat.importToNovel.placeholders.selectNovel')} />
              </SelectTrigger>
              <SelectContent>
                {novels.map(novel => (
                  <SelectItem key={novel.id} value={novel.id}>
                    {novel.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedNovelId && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">{t('chat.importToNovel.fields.volume')}</label>
              <Select
                value={selectedVolumeId || '__none__'}
                onValueChange={value => setSelectedVolumeId(value === '__none__' ? '' : value)}
                disabled={isLoadingVolumes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingVolumes ? t('chat.importToNovel.placeholders.loading') : t('chat.importToNovel.placeholders.selectVolumeNone')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('chat.importToNovel.placeholders.selectVolumeNone')}</SelectItem>
                  {volumes.map(volume => (
                    <SelectItem key={volume.id} value={volume.id}>
                      {volume.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">{t('chat.importToNovel.fields.chapterTitle')}</label>
            <Input
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder={t('chat.importToNovel.placeholders.chapterTitle')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('chat.importToNovel.actions.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !selectedNovelId || !chapterTitle.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t('chat.importToNovel.actions.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
