'use client'

import type { Crop, PixelCrop } from 'react-image-crop'
import { Check, X } from 'lucide-react'
import { useRef, useState } from 'react'
import ReactCrop from 'react-image-crop'
import { Button } from '@/components/ui/button'
import 'react-image-crop/dist/ReactCrop.css'

interface AvatarCropperProps {
  image: string
  onCropComplete: (croppedBlob: Blob) => void
  onCancel?: () => void
}

export function AvatarCropper({ image, onCropComplete, onCancel }: AvatarCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current && canvasRef.current) {
      const image = imgRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      const pixelRatio = window.devicePixelRatio

      canvas.width = completedCrop.width * pixelRatio * scaleX
      canvas.height = completedCrop.height * pixelRatio * scaleY

      ctx.scale(pixelRatio, pixelRatio)
      ctx.imageSmoothingQuality = 'high'

      const centerX = image.naturalWidth / 2
      const centerY = image.naturalHeight / 2

      ctx.save()

      ctx.translate(-completedCrop.x * scaleX, -completedCrop.y * scaleY)
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      )

      ctx.restore()

      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob)
        }
      }, 'image/jpeg', 0.95)
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-w-sm mx-auto">
        <ReactCrop
          crop={crop}
          onChange={c => setCrop(c)}
          onComplete={c => setCompletedCrop(c)}
          aspect={1}
          circularCrop
          className="max-h-[300px]"
        >
          <img
            ref={imgRef}
            src={image}
            alt="Crop preview"
            className="max-w-full h-auto"
            style={{ maxHeight: '300px' }}
          />
        </ReactCrop>
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex gap-2 justify-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setCrop(undefined)
            setCompletedCrop(undefined)
            if (onCancel) onCancel()
          }}
        >
          <X className="h-4 w-4 mr-1" />
          取消
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleCropComplete}
          disabled={!completedCrop?.width || !completedCrop?.height}
        >
          <Check className="h-4 w-4 mr-1" />
          确认裁剪
        </Button>
      </div>
    </div>
  )
}
