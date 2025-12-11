'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ImportToNovelDialog } from './import-to-novel-dialog'

interface DocumentEditorDialogProps {
  message: Message | null
  latestAssistantMessage?: Message | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DocumentEditorDialog({
  message,
  latestAssistantMessage,
  open,
  onOpenChange,
}: DocumentEditorDialogProps) {
  const activeMessage = latestAssistantMessage || message
  const editorContent = activeMessage?.content || ''
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleSave = () => {
    setIsImportDialogOpen(true)
  }

  const handleExportMarkdown = () => {
    const blob = new Blob([editorContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `document-${Date.now()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('文档已导出为 Markdown')
  }

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(editorContent)
      toast.success('内容已复制到剪贴板')
    } catch (err) {
      console.error('复制失败:', err)
      toast.error('复制失败，请手动复制')
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [open, onOpenChange])

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-40">
      <div
        className={`fixed inset-0 bg-black/20 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[600px] bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                ⋮
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuItem onClick={handleSave}>
                导入到小说
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportMarkdown}>
                导出为 Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyContent}>
                复制内容
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0">
          <TiptapEditor
            key={activeMessage?.id || 'empty'}
            content={editorContent}
            placeholder="开始编辑文档..."
            className="h-full"
            editable={true}
          />
        </div>
      </div>

      <ImportToNovelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        content={editorContent}
        onSuccess={() => {
          setIsImportDialogOpen(false)
          handleClose()
        }}
      />
    </div>,
    document.body,
  )
}
