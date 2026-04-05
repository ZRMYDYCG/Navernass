'use client'

import type { Message } from '@/lib/supabase/sdk/types'
import { BookPlus, Copy, Download, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { TiptapEditor } from '@/components/tiptap/index'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/use-i18n'
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
  const { t } = useI18n()
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
      toast.success(t('chat.documentEditor.copySuccess'))
    } catch {
      toast.error(t('chat.documentEditor.copyFailed'))
    }
  }

  const handleDownload = () => {
    try {
      const plainText = getPlainText(content)
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = t('chat.documentEditor.fileName', { timestamp: new Date().getTime() })
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(t('chat.documentEditor.downloadSuccess'))
    } catch {
      toast.error(t('chat.documentEditor.downloadFailed'))
    }
  }

  if (!isOpen) return null

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground lg:hidden"
          onClick={() => {
            const menuButton = document.querySelector('button[data-sidebar-toggle]') as HTMLButtonElement
            if (menuButton) menuButton.click()
          }}
        >
          <Menu className="w-4 h-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full px-[40px] py-4">
          <TiptapEditor
            key={editorKey}
            content={editorContent}
            onUpdate={setContent}
            placeholder={t('chat.documentEditor.placeholder')}
            className="h-full"
            editable={true}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 text-muted-foreground hover:text-foreground"
          onClick={() => setShowImportDialog(true)}
        >
          <BookPlus className="w-4 h-4 mr-1.5" />
          <span className="text-sm">{t('chat.documentEditor.save')}</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4 mr-1.5" />
            <span className="text-sm">{t('chat.documentEditor.copy')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span className="text-sm">{t('chat.documentEditor.download')}</span>
          </Button>
        </div>
      </div>

      <ImportToNovelDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        content={content}
        onSuccess={() => {
          toast.success(t('chat.documentEditor.importSuccess'))
        }}
      />
    </div>
  )
}
