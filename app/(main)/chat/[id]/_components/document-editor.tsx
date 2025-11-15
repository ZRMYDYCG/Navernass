'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { Copy, Download, FileText, Share2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import { copyTextToClipboard } from '@/lib/utils'
import { ImportToNovelDialog } from './import-to-novel-dialog'

interface DocumentEditorProps {
  message: Message | null
  latestAssistantMessage?: Message | null
  isOpen: boolean
  onClose: () => void
  onSave?: (content: string) => void
}

export function DocumentEditor({ message, latestAssistantMessage, isOpen, onClose, onSave: _onSave }: DocumentEditorProps) {
  const activeMessage = latestAssistantMessage || message
  const editorContent = activeMessage?.content || ''
  const [content, setContent] = useState(editorContent)
  const [showImportDialog, setShowImportDialog] = useState(false)

  if (activeMessage?.content && activeMessage.content !== content) {
    setContent(activeMessage.content)
  }

  const editorKey = latestAssistantMessage?.id || message?.id || 'empty'

  const getPlainText = (html: string) => {
    const div = document.createElement('div')
    div.innerHTML = html
    return div.textContent || ''
  }

  const handleCopy = async () => {
    try {
      const plainText = getPlainText(content)
      await copyTextToClipboard(plainText)
      toast.success('已复制到剪贴板')
    } catch {
      toast.error('复制失败')
    }
  }

  const handleDownload = () => {
    try {
      const plainText = getPlainText(content)
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `文档-${new Date().getTime()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('下载成功')
    } catch {
      toast.error('下载失败')
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI 写作助手',
          text: content,
        })
      } else {
        await copyTextToClipboard(content)
        toast.success('已复制到剪贴板')
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast.error('分享失败')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        {/* 左侧：导入按钮 */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          onClick={() => setShowImportDialog(true)}
        >
          <FileText className="w-4 h-4 mr-1.5" />
          <span className="text-sm">导入到小说</span>
        </Button>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-1.5" />
            <span className="text-sm">复制</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span className="text-sm">下载</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 mr-1.5" />
            <span className="text-sm">分享</span>
          </Button>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 编辑器内容 */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full px-[40px] py-4">
          <TiptapEditor
            key={editorKey}
            content={editorContent}
            onUpdate={setContent}
            placeholder="开始编辑文档..."
            className="h-full"
            editable={true}
          />
        </div>
      </div>

      {/* 导入对话框 */}
      <ImportToNovelDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        content={content}
        onSuccess={() => {
          toast.success('内容已成功导入到小说')
        }}
      />
    </div>
  )
}
