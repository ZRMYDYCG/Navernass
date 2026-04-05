'use client'

import type { Message } from '@/lib/supabase/sdk/types'

import { useCallback, useState } from 'react'

import { toast } from 'sonner'

import { useI18n } from '@/hooks/use-i18n'
import { messagesApi } from '@/lib/supabase/sdk'

export function useDocumentEditor(onMessageUpdate: (id: string, content: string) => void) {
  const { t } = useI18n()
  const [editingMessage, setEditingMessage] = useState<Message | null>(null)
  const [showDocumentEditor, setShowDocumentEditor] = useState(false)

  const handleEditMessage = useCallback((message: Message) => {
    setEditingMessage(message)
    setShowDocumentEditor(true)
  }, [])

  const handleCloseDocumentEditor = useCallback(() => {
    setShowDocumentEditor(false)
    setEditingMessage(null)
  }, [])

  const handleSaveDocument = useCallback(async (content: string) => {
    if (!editingMessage) return

    try {
      await messagesApi.update({
        id: editingMessage.id,
        content,
      })
      onMessageUpdate(editingMessage.id, content)
      toast.success(t('chat.messages.documentSaved'))
      handleCloseDocumentEditor()
    } catch (error) {
      console.error('Failed to save document:', error)
      toast.error(t('chat.messages.saveFailedRetry'))
    }
  }, [editingMessage, handleCloseDocumentEditor, onMessageUpdate, t])

  return {
    editingMessage,
    showDocumentEditor,
    setShowDocumentEditor,
    handleEditMessage,
    handleCloseDocumentEditor,
    handleSaveDocument,
  }
}
