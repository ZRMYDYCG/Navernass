'use client'

import type { Message } from '@/lib/supabase/sdk/types'

import { toPng } from 'html-to-image'
import { useCallback, useRef, useState } from 'react'

import { toast } from 'sonner'

export function useImageGeneration(selectedMessages: Message[]) {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const shareImageRef = useRef<HTMLDivElement>(null)

  const generateShareImage = useCallback(async () => {
    const node = shareImageRef.current
    if (!node) throw new Error('renderer-not-ready')

    const originalLeft = node.style.left
    const originalVisibility = node.style.visibility
    const originalPointerEvents = node.style.pointerEvents
    const originalPosition = node.style.position
    const originalTop = node.style.top
    const originalZIndex = node.style.zIndex

    node.style.left = '0px'
    node.style.visibility = 'visible'
    node.style.pointerEvents = 'auto'
    node.style.position = 'fixed'
    node.style.top = '0px'
    node.style.zIndex = '-9999'

    try {
      if (typeof document !== 'undefined' && 'fonts' in document) {
        try {
          await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
        } catch {}
      }

      await new Promise(resolve => requestAnimationFrame(() => resolve(undefined)))
      await new Promise(resolve => setTimeout(resolve, 20))

      const ratio = Math.min(3, Math.max(2, window.devicePixelRatio || 1))
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: ratio, backgroundColor: '#060915' })
      return dataUrl
    } finally {
      node.style.left = originalLeft
      node.style.visibility = originalVisibility
      node.style.pointerEvents = originalPointerEvents
      node.style.position = originalPosition
      node.style.top = originalTop
      node.style.zIndex = originalZIndex
    }
  }, [])

  const handleGenerateImage = useCallback(async () => {
    if (isGeneratingImage) return
    if (selectedMessages.length === 0) {
      toast.error('请先选择要生成图片的消息')
      return
    }

    try {
      setIsGeneratingImage(true)
      setPreviewImage(null)
      const dataUrl = await generateShareImage()
      if (!dataUrl) {
        toast.error('生成图片失败，请重试')
        return
      }
      setPreviewImage(dataUrl)
      setIsPreviewVisible(true)
    } catch (error) {
      console.error('Failed to generate image:', error)
      toast.error('生成图片失败，请重试')
    } finally {
      setIsGeneratingImage(false)
    }
  }, [generateShareImage, isGeneratingImage, selectedMessages])

  const handleDownloadPreview = useCallback(() => {
    if (!previewImage) return
    const link = document.createElement('a')
    link.href = previewImage
    link.download = `narraverse-chat-${Date.now()}.png`
    link.click()
  }, [previewImage])

  return {
    shareImageRef,
    isGeneratingImage,
    previewImage,
    isPreviewVisible,
    setIsPreviewVisible,
    handleGenerateImage,
    handleDownloadPreview,
  }
}
