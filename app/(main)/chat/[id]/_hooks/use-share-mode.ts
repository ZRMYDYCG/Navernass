'use client'

import type { Message } from '@/lib/supabase/sdk/types'

import { useCallback, useMemo, useState } from 'react'

import { toast } from 'sonner'

import { copyTextToClipboard } from '@/lib/utils'

export function useShareMode(messages: Message[], conversationId: string) {
  const [isShareMode, setIsShareMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])

  const validSelectedMessageIds = useMemo(() => {
    if (!isShareMode) return []

    const messageIdSet = new Set(messages.map(msg => msg.id))
    return selectedMessageIds.filter(id => messageIdSet.has(id))
  }, [isShareMode, messages, selectedMessageIds])

  const selectedMessages = useMemo(
    () => messages.filter(msg => validSelectedMessageIds.includes(msg.id)),
    [messages, validSelectedMessageIds],
  )

  const handleToggleShareMode = useCallback(() => {
    setIsShareMode((prev) => {
      if (prev) {
        setSelectedMessageIds([])
        return false
      }

      setSelectedMessageIds(messages.map(msg => msg.id))
      return true
    })
  }, [messages])

  const handleToggleSelectMessage = useCallback((messageId: string) => {
    setSelectedMessageIds((prev) => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId)
      }
      return [...prev, messageId]
    })
  }, [])

  const handleCancelShareMode = useCallback(() => {
    setIsShareMode(false)
    setSelectedMessageIds([])
  }, [])

  const handleCopySelectedText = useCallback(async () => {
    if (selectedMessages.length === 0) {
      toast.error('请先选择要复制的消息')
      return
    }

    const formatted = selectedMessages
      .map(msg => `${msg.role === 'user' ? '我' : 'AI'}：${msg.content}`)
      .join('\n\n')

    try {
      await copyTextToClipboard(formatted)
      toast.success('对话文本已复制')
    } catch (error) {
      console.error('Failed to copy conversation:', error)
      toast.error('复制失败，请重试')
    }
  }, [selectedMessages])

  const handleCopyConversationLink = useCallback(async () => {
    if (typeof window === 'undefined') return

    const shareUrl = `${window.location.origin}/chat/${conversationId}`

    try {
      await copyTextToClipboard(shareUrl)
      toast.success('链接已复制')
    } catch (error) {
      console.error('Failed to copy link:', error)
      toast.error('复制链接失败，请重试')
    }
  }, [conversationId])

  return {
    isShareMode,
    selectedMessageIds: validSelectedMessageIds,
    selectedMessages,
    handleToggleShareMode,
    handleToggleSelectMessage,
    handleCancelShareMode,
    handleCopySelectedText,
    handleCopyConversationLink,
  }
}
