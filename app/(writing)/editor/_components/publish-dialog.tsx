'use client'

import { useState, useEffect } from 'react'
import { Globe, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelId?: string
  chapterIds?: string[]
}

export function PublishDialog({
  open,
  onOpenChange,
  novelId,
  chapterIds = [],
}: PublishDialogProps) {
  const [publishedCount, setPublishedCount] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const publishUrl = novelId ? `http://localhost:3000/publish?id=${novelId}` : ''
  const hasPublishedChapters = publishedCount > 0

  useEffect(() => {
    if (open && novelId && chapterIds.length > 0) {
      checkPublishStatus()
    }
  }, [open, novelId, chapterIds])

  const checkPublishStatus = async () => {
    if (!novelId) return

    try {
      const response = await fetch(`/api/novels/${novelId}/published-chapters`)
      if (response.ok) {
        const result = await response.json()
        setPublishedCount(result.data?.chapters?.length || 0)
      }
    } catch (error) {
      console.error('Failed to check publish status:', error)
    }
  }

  const handlePublish = async () => {
    if (!chapterIds.length) {
      toast({
        title: '发布失败',
        description: '请先选择要发布的章节',
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)
    
    try {
      const results = await Promise.allSettled(
        chapterIds.map(id =>
          fetch(`/api/chapters/${id}/publish`, { method: 'POST' })
        )
      )

      const successCount = results.filter(r => r.status === 'fulfilled').length
      
      if (successCount > 0) {
        setPublishedCount(successCount)
        toast({
          title: '发布成功',
          description: `已发布 ${successCount} 个章节`,
        })
      } else {
        throw new Error('发布失败')
      }
    } catch (error) {
      toast({
        title: '发布失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnpublish = async () => {
    if (!chapterIds.length) return

    setIsLoading(true)
    
    try {
      await Promise.allSettled(
        chapterIds.map(id =>
          fetch(`/api/chapters/${id}/publish`, { method: 'DELETE' })
        )
      )

      setPublishedCount(0)
      toast({
        title: '已取消发布',
        description: '章节已从公开页面移除',
      })
    } catch (error) {
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publishUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a1a] border-gray-800 text-white">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10">
            <Globe className="w-8 h-8 text-blue-500" />
          </div>

          {!hasPublishedChapters ? (
            <>
              <DialogHeader className="text-center space-y-2">
                <DialogTitle className="text-white text-xl">
                  发布此文档
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  与世界分享您的文档
                </DialogDescription>
              </DialogHeader>

              <Button
                onClick={handlePublish}
                disabled={isLoading || !chapterIds.length}
                className="w-full bg-white text-black hover:bg-gray-100 h-11 rounded-lg font-medium"
              >
                {isLoading ? '发布中...' : '发布'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-gray-300">
                  已发布 {publishedCount} 个章节
                </span>
              </div>

              <div className="w-full flex items-center gap-2 bg-[#2a2a2a] rounded-lg p-3 border border-gray-800">
                <input
                  type="text"
                  value={publishUrl}
                  readOnly
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                />
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-700"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleUnpublish}
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 h-11 rounded-lg font-medium"
              >
                {isLoading ? '取消中...' : '取消发布'}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
