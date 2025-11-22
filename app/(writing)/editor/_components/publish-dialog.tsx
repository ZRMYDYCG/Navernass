'use client'

import { useState } from 'react'
import { Globe, Copy, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId?: string
}

export function PublishDialog({
  open,
  onOpenChange,
  documentId = 'example-doc-id',
}: PublishDialogProps) {
  const [isPublished, setIsPublished] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const publishUrl = `http://localhost:3000/publish?id=${documentId}`

  const handlePublish = async () => {
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsPublished(true)
    setIsLoading(false)
  }

  const handleUnpublish = async () => {
    setIsLoading(true)
    
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsPublished(false)
    setIsLoading(false)
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

          {!isPublished ? (
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
                disabled={isLoading}
                className="w-full bg-white text-black hover:bg-gray-100 h-11 rounded-lg font-medium"
              >
                {isLoading ? '发布中...' : '发布'}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-blue-500" />
                <span className="text-gray-300">此文档已发布</span>
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
