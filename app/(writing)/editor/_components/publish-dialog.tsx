'use client'

import { Check, Copy, Globe } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { novelsApi } from '@/lib/supabase/sdk'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  novelId?: string
  chapterIds?: string[]
}

const DEFAULT_CHAPTER_IDS: string[] = []

export function PublishDialog({
  open,
  onOpenChange,
  novelId,
  chapterIds = DEFAULT_CHAPTER_IDS,
}: PublishDialogProps) {
  const [publishedCount, setPublishedCount] = useState(0)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const { toast } = useToast()

  const publishUrl = novelId ? `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/publish?id=${novelId}` : ''
  const hasPublishedChapters = publishedCount > 0

  const checkPublishStatus = useCallback(async () => {
    if (!novelId) return

    setIsCheckingStatus(true)
    try {
      const response = await fetch(`/api/novels/${novelId}/published-chapters`)
      if (response.ok) {
        const result = await response.json()
        setPublishedCount(result.data?.chapters?.length || 0)
      }
    } catch (error) {
      console.error('Failed to check publish status:', error)
      setPublishedCount(0)
    } finally {
      setIsCheckingStatus(false)
    }
  }, [novelId])

  useEffect(() => {
    if (open && novelId && chapterIds.length > 0) {
      checkPublishStatus()
    }
  }, [open, novelId, chapterIds, checkPublishStatus])

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
          fetch(`/api/chapters/${id}/publish`, { method: 'POST' }),
        ),
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
        description: `请稍后重试, ${(error as Error).message}`,
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
          fetch(`/api/chapters/${id}/publish`, { method: 'DELETE' }),
        ),
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
        description: `请稍后重试, ${(error as Error).message}`,
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
      <DialogContent className="sm:max-w-md bg-card border border-border text-foreground">
        <div className="flex flex-col items-center gap-4 py-6">
          {isCheckingStatus
            ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10">
                    <Globe className="w-8 h-8 text-sky-500 animate-pulse" />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    检查发布状态中...
                  </div>
                </div>
              )
            : hasPublishedChapters
              ? (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10">
                      <Globe className="w-8 h-8 text-sky-500" />
                    </div>
                    <div className="text-sm text-foreground">
                      已发布
                      {' '}
                      {publishedCount}
                      {' '}
                      个章节
                    </div>

                    <div className="w-full flex items-center gap-2 bg-background/80 rounded-lg p-3 border border-border">
                      <input
                        type="text"
                        value={publishUrl}
                        readOnly
                        className="flex-1 bg-transparent text-foreground text-sm outline-none"
                      />
                      <Button
                        onClick={handleCopy}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-accent"
                      >
                        {isCopied
                          ? (
                              <Check className="w-4 h-4 text-green-500" />
                            )
                          : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                      </Button>
                    </div>

                    <Button
                      onClick={handleUnpublish}
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {isLoading ? '取消中...' : '取消发布'}
                    </Button>
                  </>
                )
              : (
                  <>
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10">
                      <Globe className="w-8 h-8 text-sky-500" />
                    </div>
                    <DialogHeader className="text-center space-y-2">
                      <DialogTitle className="text-xl text-foreground">
                        发布此文档
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        与世界分享您的文档
                      </DialogDescription>
                    </DialogHeader>

                    <Button
                      onClick={handlePublish}
                      disabled={isLoading || !chapterIds.length}
                      className="w-full h-11 rounded-lg font-medium bg-primary text-primary-foreground hover:opacity-90"
                    >
                      {isLoading ? '发布中...' : '发布'}
                    </Button>
                  </>
                )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
