'use client'

import type { ImperativePanelHandle } from 'react-resizable-panels'
import type { Message } from '@/lib/supabase/sdk/types'

import { useCallback, useRef, useState } from 'react'

import { toast } from 'sonner'

import { messagesApi } from '@/lib/supabase/sdk'

export function useDocumentEditor(onMessageUpdate: (id: string, content: string) => void) {
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)
  const rightPanelRef = useRef<ImperativePanelHandle>(null)

  const handleEditMessage = useCallback((message: Message) => {
    setEditingMessage(message)
    setShowDocumentEditor(true)
    if (rightPanelRef.current && rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.expand()
    }
  }, [])

  const handleCloseDocumentEditor = useCallback(() => {
    setShowDocumentEditor(false)
    setEditingMessage(null)
    if (rightPanelRef.current && !rightPanelRef.current.isCollapsed()) {
      rightPanelRef.current.collapse()
    }
  }, [])

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!editingMessage) return

    try {
      await messagesApi.update({
        id: editingMessage.id,
        content,
      })
      onMessageUpdate(editingMessage.id, content)
      toast.success('文档已保存')
      handleCloseDocumentEditor()
    } catch (error) {
      console.error('Failed to save document:', error)
      toast.error('保存失败，请重试')
    }
  }, [editingMessage, handleCloseDocumentEditor, onMessageUpdate])

  return {
    editingMessage,
    showDocumentEditor,
    setShowDocumentEditor,
    rightPanelRef,
    handleEditMessage,
    handleCloseDocumentEditor,
    handleSaveDocument,
  }
}
