'use client'

import { Image as ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface ImageGeneratorPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageGenerated?: (url: string) => void
}

export function ImageGeneratorPanel({
  open,
  onOpenChange,
  onImageGenerated,
}: ImageGeneratorPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationType, setGenerationType] = useState<'text-to-image' | 'image-to-image'>('text-to-image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (evt) => {
        setImagePreview(evt.target?.result as string)
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
        onImageGenerated?.(generatedImageUrl)
        toast.success('图片生成成功！')
        onOpenChange(false)
        // reset local states
        setPrompt('')
        setNegativePrompt('')
        setImageFile(null)
        setImagePreview(null)
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
    <div className="border border-border rounded-lg p-3 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">AI 图片生成</h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onOpenChange(false)}
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
          onChange={e => setPrompt(e.target.value)}
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
          onChange={e => setNegativePrompt(e.target.value)}
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
  )
}
