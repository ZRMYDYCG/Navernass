'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { ChevronDown, Copy, Download, Share2, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import { copyTextToClipboard } from '@/lib/utils'

interface DocumentEditorProps {
  message: Message | null
  isOpen: boolean
  onClose: () => void
  onSave?: (content: string) => void
}

export function DocumentEditor({ message, isOpen, onClose, onSave: _onSave }: DocumentEditorProps) {
  // 直接使用 message 的内容，通过 key 属性来重置编辑器
  const initialContent = message?.content || ''
  const [content, setContent] = useState(initialContent)

  // 当 message 变化时，重置内容（通过 key 属性触发重新渲染）
  const editorKey = message?.id || 'empty'

  // 从 HTML 中提取纯文本
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
      <div className="flex items-center justify-between px-4 py-3">
        {/* 左侧：AI 写作助手 */}
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">AI 写作助手</span>
          <ChevronDown className="w-4 h-4 text-blue-500" />
        </div>

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
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <TiptapEditor
            key={editorKey}
            content={initialContent}
            onUpdate={setContent}
            placeholder="开始编辑文档..."
            className="h-full"
            editable={true}
          />
        </div>
      </div>
    </div>
  )
}
