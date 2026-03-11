'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { useState } from 'react'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ImportToNovelDialog } from './import-to-novel-dialog'

interface DocumentEditorDialogProps {
  message: Message | null
  latestAssistantMessage?: Message | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (content: string) => void | Promise<void>
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

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-none flex flex-col p-0 gap-0">
          <SheetHeader className="flex flex-row items-center justify-between px-4 sm:px-6 py-4 border-b border-border space-y-0 text-left">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-medium">文档编辑</SheetTitle>
            </div>
            <div className="flex items-center gap-2">
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
                <DropdownMenuContent align="end" className="w-40">
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
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 min-h-0 bg-card text-card-foreground">
            <TiptapEditor
              key={activeMessage?.id || 'empty'}
              content={editorContent}
              placeholder="开始编辑文档..."
              className="h-full"
              editable={true}
            />
          </div>
        </SheetContent>
      </Sheet>

      <ImportToNovelDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        content={editorContent}
        onSuccess={() => {
          setIsImportDialogOpen(false)
          onOpenChange(false)
        }}
      />
    </>
  )
}
