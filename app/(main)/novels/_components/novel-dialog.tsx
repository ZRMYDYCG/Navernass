import type { Crop } from 'react-image-crop'
import type { NovelFormData } from '../types'
import type { Novel } from '@/lib/supabase/sdk'
import { useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import 'react-image-crop/dist/ReactCrop.css'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  if (aspect === 1) {
    return centerCrop(
      {
        unit: '%',
        width: 90,
        height: 90,
        x: 5,
        y: 5,
      },
      mediaWidth,
      mediaHeight,
    )
  }
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

async function getCroppedFile(image: HTMLImageElement, crop: Crop, fileName: string): Promise<File> {
  const scaleX = image.naturalWidth / 100
  const scaleY = image.naturalHeight / 100
  const width = (crop.width || 0) * scaleX
  const height = (crop.height || 0) * scaleY
  const x = (crop.x || 0) * scaleX
  const y = (crop.y || 0) * scaleY
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (!b) {
        reject(new Error('Failed to create blob'))
        return
      }
      resolve(b)
    }, 'image/jpeg', 0.9)
  })
  return new File([blob], fileName || 'cover.jpg', { type: blob.type })
}

interface NovelDialogProps {
  open: boolean
  novel: Novel | null
  onOpenChange: (open: boolean) => void
  onSave: (data: NovelFormData) => Promise<void>
}

export function NovelDialog({ open, novel, onOpenChange, onSave }: NovelDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop | undefined>()
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(novel?.title || '')
      setDescription(novel?.description || '')
      setCoverFile(null)
      setPreviewUrl(novel?.cover || null)
      setCrop(undefined)
      setShowCropper(false)
    }
  }, [open, novel])

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await onSave({ title: title.trim(), description: description.trim(), coverFile })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle>{novel ? '编辑小说信息' : '创建新小说'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              小说标题
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入小说标题"
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              简介（可选）
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="请输入小说简介"
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground focus:ring-0 focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              上传小说封面
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null
                setCoverFile(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreviewUrl((prev) => {
                    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
                    return url
                  })
                  setCrop(undefined)
                  setShowCropper(true)
                }
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:opacity-90"
            />
            {coverFile && (
              <p className="mt-1 text-xs text-muted-foreground truncate">
                已选择:
                {' '}
                {coverFile.name}
              </p>
            )}
            {previewUrl && (
              <div className="mt-3">
                <div className="mb-1 text-xs text-muted-foreground">封面预览（点击可裁剪）</div>
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  className="inline-block max-w-[200px] rounded-md overflow-hidden border border-border bg-secondary hover:border-muted-foreground transition-colors"
                >
                  <img src={previewUrl} alt="封面预览" className="w-full h-auto object-contain" />
                </button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1"
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
          >
            {isSaving
              ? novel
                ? '保存中...'
                : '创建中...'
              : novel
                ? '保存'
                : '创建'}
          </Button>
        </DialogFooter>
      </DialogContent>
      {previewUrl && (
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle>裁剪封面</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <div className="w-full rounded-lg overflow-hidden border border-border bg-secondary">
                <ReactCrop
                  crop={crop}
                  keepSelection
                  onChange={(_pixelCrop, percentCrop: Crop) => setCrop(percentCrop)}
                  className="w-full"
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="封面裁剪"
                    className="w-full max-h-96 object-contain"
                    onLoad={(e) => {
                      const img = e.currentTarget
                      setCrop((prev: Crop | undefined) => prev || centerAspectCrop(img.naturalWidth, img.naturalHeight, 1))
                    }}
                  />
                </ReactCrop>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCropper(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!imageRef.current || !crop || !crop.width || !crop.height || !coverFile) {
                    setShowCropper(false)
                    return
                  }
                  try {
                    const cropped = await getCroppedFile(imageRef.current, crop, coverFile.name)
                    setCoverFile(cropped)
                    const url = URL.createObjectURL(cropped)
                    setPreviewUrl((prev) => {
                      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
                      return url
                    })
                  } catch {}
                  setShowCropper(false)
                }}
              >
                应用裁剪
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
