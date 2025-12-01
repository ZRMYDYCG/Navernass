import type { Novel } from '@/lib/supabase/sdk'
import { useEffect, useRef, useState } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { NovelFormData } from '../types'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
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
    canvas.toBlob(b => {
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
      <DialogContent className="sm:max-w-md bg-[#F9F8F4] dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
        <DialogHeader>
          <DialogTitle>{novel ? '编辑小说信息' : '创建新小说'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-200 mb-2">
              小说标题
              {' '}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="请输入小说标题"
              className="w-full px-4 py-2 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-stone-900 dark:focus:border-zinc-100 focus:ring-0 focus-visible:ring-1 focus-visible:ring-stone-900/40 dark:focus-visible:ring-zinc-100/30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-200 mb-2">
              简介（可选）
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="请输入小说简介"
              rows={3}
              className="w-full px-4 py-2 border border-stone-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-stone-900 dark:focus:border-zinc-100 focus:ring-0 focus-visible:ring-1 focus-visible:ring-stone-900/40 dark:focus-visible:ring-zinc-100/30 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-zinc-200 mb-2">
              封面图片（可选）
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files?.[0] || null
                setCoverFile(file)
                if (file) {
                  const url = URL.createObjectURL(file)
                  setPreviewUrl(prev => {
                    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
                    return url
                  })
                  setCrop(undefined)
                  setShowCropper(true)
                }
              }}
              className="block w-full text-sm text-stone-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
            />
            {coverFile && (
              <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400 truncate">
                已选择: {coverFile.name}
              </p>
            )}
            {previewUrl && (
              <div className="mt-3">
                <div className="mb-1 text-xs text-stone-500 dark:text-zinc-400">封面预览（点击可裁剪）</div>
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  className="w-20 aspect-[3/4] rounded-md overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100/60 dark:bg-zinc-800/60 hover:border-stone-400 dark:hover:border-zinc-500 transition-colors"
                >
                  <img src={previewUrl} alt="封面预览" className="w-full h-full object-cover" />
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
            className="flex-1 bg-black dark:bg-zinc-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
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
          <DialogContent className="sm:max-w-md bg-[#F9F8F4] dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle>裁剪封面</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <div className="w-full rounded-lg overflow-hidden border border-stone-200 dark:border-zinc-700 bg-stone-100/60 dark:bg-zinc-800/60">
                <ReactCrop
                  crop={crop}
                  aspect={3 / 4}
                  keepSelection
                  onChange={(_pixelCrop, percentCrop: Crop) => setCrop(percentCrop)}
                  className="w-full"
                >
                  <img
                    ref={imageRef}
                    src={previewUrl}
                    alt="封面裁剪"
                    className="w-full max-h-96 object-contain"
                    onLoad={e => {
                      const img = e.currentTarget
                      setCrop((prev: Crop | undefined) => prev || centerAspectCrop(img.naturalWidth, img.naturalHeight, 3 / 4))
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
                    setPreviewUrl(prev => {
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
