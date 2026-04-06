'use client'

import type { Crop } from 'react-image-crop'
import type { NovelFormData } from '../types'
import type { Novel } from '@/lib/supabase/sdk'
import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useI18n } from '@/hooks/use-i18n'
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
  const { t } = useI18n()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
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
      setTags(novel?.tags ?? [])
      setTagInput('')
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

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().replace(/,$/, '')
      if (val && !tags.includes(val)) {
        setTags(prev => [...prev, val])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const pendingTag = tagInput.trim()
      const finalTags = pendingTag && !tags.includes(pendingTag) ? [...tags, pendingTag] : tags
      await onSave({ title: title.trim(), description: description.trim(), coverFile, tags: finalTags })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border">
        <DialogHeader>
          <DialogTitle>{novel ? t('novels.dialog.editTitle') : t('novels.dialog.createTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="novel-title">
              {t('novels.dialog.titleLabel')}
              {' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="novel-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('novels.dialog.titlePlaceholder')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="novel-description">
              {t('novels.dialog.descriptionLabel')}
            </Label>
            <Textarea
              id="novel-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('novels.dialog.descriptionPlaceholder')}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>
              {t('novels.dialog.tagsLabel')}
            </Label>
            <div className="flex flex-wrap gap-1.5 p-2 min-h-[42px] border border-border rounded-lg bg-background focus-within:border-foreground focus-within:ring-1 focus-within:ring-ring">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-sm border border-border"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length === 0 ? t('novels.dialog.tagsPlaceholder') : ''}
                className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{t('novels.dialog.tagsHint')}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover-upload">
              {t('novels.dialog.coverLabel')}
            </Label>
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
              className="hidden"
              id="cover-upload"
            />
            {!previewUrl
              ? (
                  <label
                    htmlFor="cover-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-muted-foreground hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="text-sm text-muted-foreground">{t('novels.dialog.coverUploadHint')}</p>
                    </div>
                  </label>
                )
              : (
                  <div className="space-y-3">
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center justify-center w-full px-4 py-2 text-sm border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                    >
                      {t('novels.dialog.coverReplace')}
                    </label>
                    <div>
                      <div className="mb-1 text-xs text-muted-foreground">{t('novels.dialog.coverPreview')}</div>
                      <button
                        type="button"
                        onClick={() => setShowCropper(true)}
                        className="inline-block max-w-[200px] rounded-md overflow-hidden border border-border bg-secondary hover:border-muted-foreground transition-colors"
                      >
                        <img src={previewUrl} alt={t('novels.dialog.coverPreview')} className="w-full h-auto object-contain" />
                      </button>
                    </div>
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
            {t('novels.dialog.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-primary text-primary-foreground hover:opacity-90"
          >
            {isSaving
              ? novel
                ? t('novels.dialog.saving')
                : t('novels.dialog.creating')
              : novel
                ? t('novels.dialog.save')
                : t('novels.dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
      {previewUrl && (
        <Dialog open={showCropper} onOpenChange={setShowCropper}>
          <DialogContent className="sm:max-w-md bg-card border border-border">
            <DialogHeader>
              <DialogTitle>{t('novels.dialog.cropTitle')}</DialogTitle>
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
                    alt={t('novels.dialog.cropAlt')}
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
                {t('novels.dialog.cancel')}
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
                {t('novels.dialog.cropApply')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  )
}
