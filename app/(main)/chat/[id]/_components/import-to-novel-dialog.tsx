'use client'

import type { Chapter, Novel, Volume } from '@/lib/supabase/sdk/types'
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
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedNovelId, setSelectedNovelId] = useState<string>('')
  const [selectedVolumeId, setSelectedVolumeId] = useState<string>('')
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingNovels, setIsLoadingNovels] = useState(false)
  const [isLoadingVolumes, setIsLoadingVolumes] = useState(false)
  const [isLoadingChapters, setIsLoadingChapters] = useState(false)
  const [importMode, setImportMode] = useState<'new' | 'update'>('new')

  const handleImport = async () => {
    if (!selectedNovelId) {
      toast.error('请选择小说')
      return
    }

    if (importMode === 'new' && !chapterTitle.trim()) {
      toast.error('请输入章节标题')
      return
    }

    if (importMode === 'update' && !selectedChapterId) {
      toast.error('请选择要更新的章节')
      return
    }

    try {
      setIsLoading(true)

      if (importMode === 'new') {
        // 创建新章节
        const existingChapters = selectedVolumeId
          ? chapters.filter(ch => ch.volume_id === selectedVolumeId)
          : chapters.filter(ch => !ch.volume_id)
        const orderIndex = existingChapters.length > 0
          ? Math.max(...existingChapters.map(ch => ch.order_index || 0)) + 1
          : 1

        const chapterData = {
          novel_id: selectedNovelId,
          title: chapterTitle.trim(),
          content: content || '',
          order_index: orderIndex,
          ...(selectedVolumeId && { volume_id: selectedVolumeId }),
        }

        await chaptersApi.create(chapterData)
        toast.success('章节创建成功')
      } else {
        // 更新现有章节
        if (!content) {
          toast.error('内容不能为空')
          return
        }

        const updateData = {
          id: selectedChapterId,
          content,
        }

        await chaptersApi.update(updateData)
        toast.success('章节更新成功')
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }

      // 重置表单
      setSelectedNovelId('')
      setSelectedVolumeId('')
      setSelectedChapterId('')
      setChapterTitle('')
      setImportMode('new')
    } catch (error) {
      console.error('Failed to import:', error)
      let errorMessage = '未知错误'

      if (error instanceof Error) {
        errorMessage = error.message
        // 尝试从错误对象中提取更多信息
        if ('details' in error && error.details) {
          console.error('Error details:', error.details)
        }
        if ('code' in error && error.code) {
          console.error('Error code:', error.code)
        }
      } else if (typeof error === 'object' && error !== null) {
        // 尝试从 API 响应中提取错误信息
        if ('message' in error) {
          errorMessage = String(error.message)
        }
      }

      toast.error(`${importMode === 'new' ? '创建章节失败' : '更新章节失败'}: ${errorMessage}`)
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

  // 当选择小说时，加载卷和章节
  useEffect(() => {
    if (!selectedNovelId) {
      setVolumes([])
      setChapters([])
      setSelectedVolumeId('')
      setSelectedChapterId('')
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

    const loadChapters = async () => {
      try {
        setIsLoadingChapters(true)
        const chaptersList = await chaptersApi.getByNovelId(selectedNovelId)
        setChapters(chaptersList)
      } catch (error) {
        console.error('Failed to load chapters:', error)
        toast.error('加载章节列表失败')
      } finally {
        setIsLoadingChapters(false)
      }
    }

    loadVolumes()
    loadChapters()
  }, [selectedNovelId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            导入到小说
          </DialogTitle>
          <DialogDescription>
            将当前编辑的内容导入到你的小说创作中
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 导入模式选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">导入方式</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={importMode === 'new' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setImportMode('new')
                  setSelectedChapterId('')
                }}
              >
                创建新章节
              </Button>
              <Button
                type="button"
                variant={importMode === 'update' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setImportMode('update')
                  setChapterTitle('')
                }}
              >
                更新现有章节
              </Button>
            </div>
          </div>

          {/* 选择小说 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">选择小说 *</label>
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

          {/* 选择卷（可选） */}
          {selectedNovelId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">选择卷（可选）</label>
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

          {/* 创建新章节：输入标题 */}
          {importMode === 'new' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">章节标题 *</label>
              <Input
                value={chapterTitle}
                onChange={e => setChapterTitle(e.target.value)}
                placeholder="请输入章节标题"
              />
            </div>
          )}

          {/* 更新现有章节：选择章节 */}
          {importMode === 'update' && selectedNovelId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">选择章节 *</label>
              <Select
                value={selectedChapterId}
                onValueChange={setSelectedChapterId}
                disabled={isLoadingChapters}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingChapters ? '加载中...' : '请选择要更新的章节'} />
                </SelectTrigger>
                <SelectContent>
                  {chapters
                    .filter(ch => !selectedVolumeId || ch.volume_id === selectedVolumeId)
                    .map(chapter => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
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
            disabled={isLoading || !selectedNovelId || (importMode === 'new' && !chapterTitle.trim()) || (importMode === 'update' && !selectedChapterId)}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {importMode === 'new' ? '创建章节' : '更新章节'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
