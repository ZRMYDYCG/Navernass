import { Copy, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as Tooltip from '@radix-ui/react-tooltip'
import { BatchActionsDialog } from './batch-actions-dialog'
import { Button } from '@/components/ui/button'

interface Chapter {
  id: string
  title: string
}

const EMPTY_CHAPTERS: Chapter[] = []

interface QuickActionsProps {
  onCreateChapter?: () => void
  onBatchDelete?: () => void
  onBatchCopy?: () => void
  chapters?: Chapter[]
  novelId?: string
  onChaptersChanged?: () => void
  chaptersCount?: number
  onImageGenerated?: (imageUrl: string) => void
}

export function QuickActions({
  onCreateChapter,
  onBatchDelete,
  onBatchCopy,
  chapters = EMPTY_CHAPTERS,
  novelId,
  onChaptersChanged,
  chaptersCount = 0,
  onImageGenerated,
}: QuickActionsProps) {
  const [isProcessing] = useState(false)
  const [batchCopyOpen, setBatchCopyOpen] = useState(false)
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationType, setGenerationType] = useState<'text-to-image' | 'image-to-image'>('text-to-image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleCreateChapter = () => {
    if (onCreateChapter) {
      onCreateChapter()
    } else {
      toast.info('请从章节列表创建新章节')
    }
  }

  const handleBatchDelete = async () => {
    if (chaptersCount === 0) {
      toast.error('没有可删除的章节')
      return
    }
    if (onBatchDelete) {
      onBatchDelete()
    } else if (chapters.length > 0 && novelId) {
      setBatchDeleteOpen(true)
    } else {
      toast.info('批量删除功能开发中')
    }
  }

  const handleBatchCopy = async () => {
    if (chaptersCount === 0) {
      toast.error('没有可复制的章节')
      return
    }
    if (onBatchCopy) {
      onBatchCopy()
    } else if (chapters.length > 0 && novelId) {
      setBatchCopyOpen(true)
    } else {
      toast.info('批量复制功能开发中')
    }
  }

  // 批量复制处理
  const handleBatchCopyConfirm = async (selectedIds: string[]) => {
    if (!novelId) return

    const { chaptersApi } = await import('@/lib/supabase/sdk')

    try {
      // 获取所有章节
      const allChapters = await chaptersApi.getByNovelId(novelId)
      const selectedChapters = allChapters.filter(ch => selectedIds.includes(ch.id))

      // 获取最大 order_index
      const maxOrderIndex = allChapters.length > 0
        ? Math.max(...allChapters.map(c => c.order_index))
        : -1

      let currentOrderIndex = maxOrderIndex + 1

      // 复制每个选中的章节
      for (const chapter of selectedChapters) {
        await chaptersApi.create({
          novel_id: novelId,
          title: `${chapter.title} (副本)`,
          content: chapter.content || '',
          order_index: currentOrderIndex,
          volume_id: chapter.volume_id || undefined,
        })
        currentOrderIndex++
      }

      if (onChaptersChanged) {
        onChaptersChanged()
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('批量复制失败:', error)
      throw error
    }
  }

  // 批量删除处理
  const handleBatchDeleteConfirm = async (selectedIds: string[]) => {
    if (!novelId) return

    const { chaptersApi } = await import('@/lib/supabase/sdk')

    try {
      // 删除每个选中的章节
      for (const chapterId of selectedIds) {
        await chaptersApi.delete(chapterId)
      }

      if (onChaptersChanged) {
        onChaptersChanged()
      } else {
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    } catch (error) {
      console.error('批量删除失败:', error)
      throw error
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('请输入图片描述')
      return
    }

    if (generationType === 'image-to-image' && !imageFile) {
      toast.error('请上传参考图片')
      return
    }

    setIsGenerating(true)
    try {
      let imageUrl = ''

      if (generationType === 'image-to-image' && imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('conversationId', 'temp')

        const uploadResponse = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error('图片上传失败')
        }

        const uploadData = await uploadResponse.json()
        imageUrl = uploadData.url
      }

      const generateResponse = await fetch('/api/images/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: generationType,
          prompt,
          negative_prompt: negativePrompt || undefined,
          image_url: imageUrl || undefined,
          size: '1024x1024',
          num_images: 1,
        }),
      })

      if (!generateResponse.ok) {
        const error = await generateResponse.json()
        throw new Error(error.error || '图片生成失败')
      }

      const data = await generateResponse.json()

      if (data.images && data.images.length > 0) {
        const generatedImageUrl = data.images[0].url
        if (onImageGenerated) {
          onImageGenerated(generatedImageUrl)
        }
        setGeneratedImages(prev => [generatedImageUrl, ...prev])
        setShowImageGenerator(false)
        setPrompt('')
        setNegativePrompt('')
        setImageFile(null)
        setImagePreview(null)
        toast.success('图片生成成功！')
      } else {
        throw new Error('未返回生成的图片')
      }
    } catch (error: any) {
      console.error('Image generation error:', error)
      toast.error(error.message || '图片生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground px-1 font-serif">
          快速操作
        </span>
        <div className="flex gap-1">
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleCreateChapter}
              disabled={isProcessing}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-all text-muted-foreground hover:text-foreground hover:shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              新建章节
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={() => setShowImageGenerator(!showImageGenerator)}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-all text-muted-foreground hover:text-foreground hover:shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              AI 图片生成
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleBatchCopy}
              disabled={isProcessing || chaptersCount === 0}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-all text-muted-foreground hover:text-foreground hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              批量复制
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              onClick={handleBatchDelete}
              disabled={isProcessing || chaptersCount === 0}
              className="p-1.5 h-7 w-7 flex items-center justify-center hover:bg-accent rounded-md transition-all text-muted-foreground hover:text-foreground hover:shadow-sm hover:text-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="bg-foreground text-background text-[11px] px-2 py-1 rounded shadow-md animate-in fade-in-0 zoom-in-95">
              批量删除
              <Tooltip.Arrow className="fill-foreground" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
        </div>
      </div>

      {showImageGenerator && (
        <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">AI 图片生成</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageGenerator(false)}
              className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-1">
              <Button
                type="button"
                variant={generationType === 'text-to-image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGenerationType('text-to-image')}
                className="flex-1 text-xs"
              >
                文生图
              </Button>
              <Button
                type="button"
                variant={generationType === 'image-to-image' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setGenerationType('image-to-image')}
                className="flex-1 text-xs"
              >
                图生图
              </Button>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述你想要生成的图片..."
              className="w-full px-3 py-2 text-xs bg-background rounded-md border border-border resize-none focus:ring-1 focus:ring-primary"
              rows={2}
            />

            {generationType === 'image-to-image' && (
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center gap-2 px-3 py-2 text-xs bg-background rounded-md border border-border cursor-pointer hover:bg-accent transition-colors"
                >
                  {imageFile ? '更换图片' : '上传参考图片'}
                </label>
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="参考图片"
                      className="w-full h-24 object-cover rounded-md border border-border"
                    />
                  </div>
                )}
              </div>
            )}

            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              placeholder="负面提示词（可选）"
              className="w-full px-3 py-2 text-xs bg-background rounded-md border border-border focus:ring-1 focus:ring-primary"
            />

            <Button
              type="button"
              onClick={handleImageGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
              size="sm"
            >
              {isGenerating ? '生成中...' : '生成图片'}
            </Button>
          </div>
        </div>
      )}

      {/* 批量复制对话框 */}
      {chapters.length > 0 && novelId && (
        <BatchActionsDialog
          open={batchCopyOpen}
          onOpenChange={setBatchCopyOpen}
          chapters={chapters}
          mode="copy"
          onConfirm={handleBatchCopyConfirm}
        />
      )}

      {/* 批量删除对话框 */}
      {chapters.length > 0 && novelId && (
        <BatchActionsDialog
          open={batchDeleteOpen}
          onOpenChange={setBatchDeleteOpen}
          chapters={chapters}
          mode="delete"
          onConfirm={handleBatchDeleteConfirm}
        />
      )}

      {generatedImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground px-1 font-serif">
              生成的图片
            </span>
            <button
              type="button"
              onClick={() => setGeneratedImages([])}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              清空
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <img
                  src={imageUrl}
                  alt={`Generated ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs text-white">查看</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
