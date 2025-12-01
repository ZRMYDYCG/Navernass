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
import { novelsApi } from '@/lib/supabase/sdk'

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
        if (novelId) {
          try {
            await novelsApi.publish(novelId)
          } catch (error) {
            console.error('Failed to publish novel:', error)
          }
        }
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

      if (novelId) {
        try {
          await novelsApi.unpublish(novelId)
        } catch (error) {
          console.error('Failed to unpublish novel:', error)
        }
      }

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
      <DialogContent className="sm:max-w-md bg-[#F9F8F4] dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-zinc-100">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 dark:bg-sky-500/20">
            <Globe className="w-8 h-8 text-sky-500" />
          </div>

          {!hasPublishedChapters ? (
            <>
              <DialogHeader className="text-center space-y-2">
                <DialogTitle className="text-xl text-stone-900 dark:text-zinc-100">
                  发布此文档
                </DialogTitle>
                <DialogDescription className="text-stone-500 dark:text-zinc-400">
                  与世界分享您的文档
                </DialogDescription>
              </DialogHeader>

              <Button
                onClick={handlePublish}
                disabled={isLoading || !chapterIds.length}
                className="w-full h-11 rounded-lg font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {isLoading ? '发布中...' : '发布'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-sky-500" />
                <span className="text-stone-600 dark:text-zinc-300">
                  已发布 {publishedCount} 个章节
                </span>
              </div>

              <div className="w-full flex items-center gap-2 bg-white/80 dark:bg-zinc-900/60 rounded-lg p-3 border border-stone-200 dark:border-zinc-700">
                <input
                  type="text"
                  value={publishUrl}
                  readOnly
                  className="flex-1 bg-transparent text-stone-800 dark:text-zinc-100 text-sm outline-none"
                />
                <Button
                  onClick={handleCopy}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-stone-100 dark:hover:bg-zinc-800"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-stone-400 dark:text-zinc-400" />
                  )}
                </Button>
              </div>

              <Button
                onClick={handleUnpublish}
                disabled={isLoading}
                className="w-full h-11 rounded-lg font-medium bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
