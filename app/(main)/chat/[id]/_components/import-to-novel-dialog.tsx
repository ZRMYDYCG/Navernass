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
      toast.error('请选择小说')
      return
    }

    if (!chapterTitle.trim()) {
      toast.error('请输入章节标题')
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
      toast.success('章节创建成功')

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }

      setSelectedNovelId('')
      setSelectedVolumeId('')
      setChapterTitle('')
    } catch (error) {
      console.error('Failed to import:', error)
      let errorMessage = '未知错误'

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

      toast.error(`创建章节失败: ${errorMessage}`)
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
        toast.error('加载小说列表失败')
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
        toast.error('加载卷列表失败')
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
            创建新章节
          </DialogTitle>
          <DialogDescription>
            将当前编辑的内容保存为新章节
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">选择小说 *</label>
            <Select
              value={selectedNovelId}
              onValueChange={setSelectedNovelId}
              disabled={isLoadingNovels}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingNovels ? '加载中...' : '请选择小说'} />
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
              <label className="block text-sm font-medium text-foreground">选择卷（可选）</label>
              <Select
                value={selectedVolumeId || '__none__'}
                onValueChange={value => setSelectedVolumeId(value === '__none__' ? '' : value)}
                disabled={isLoadingVolumes}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingVolumes ? '加载中...' : '不选择卷（直接属于小说）'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">不选择卷（直接属于小说）</SelectItem>
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
            <label className="block text-sm font-medium text-foreground">章节标题 *</label>
            <Input
              value={chapterTitle}
              onChange={e => setChapterTitle(e.target.value)}
              placeholder="请输入章节标题"
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
            取消
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !selectedNovelId || !chapterTitle.trim()}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            创建章节
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
