'use client'

import type { ReactNode } from 'react'
import { useCallback, useMemo } from 'react'
import type { UIMessage } from 'ai'
import { useI18n } from '@/hooks/use-i18n'
import { ChatActionsProvider } from './parts/re-exports'

interface ChatActionsWrapperProps {
  isLoading: boolean
  onSend: (text: string) => void | Promise<void>
  /** 当前会话的 messages（用于按 formKey 找到对应 part 的 toolCallId） */
  messages: UIMessage[]
  /** 把 ask_user 表单标记为已提交（含持久化），由 useChatAgent 提供 */
  markFormSubmitted: (toolCallId: string, submittedValues: Record<string, string>) => void
  children: ReactNode
}

/**
 * 把 useChatAgent 的 sendMessage 包成 ChatActionsProvider 期望的接口。
 * 这样 ask_user 表单提交时：
 *   1) 结构化字段被序列化为文本消息发回 server
 *   2) 对应 part.output.submitted 同步落库 → 刷新后表单保持「已提交」态
 */
export function ChatActionsWrapper({
  isLoading,
  onSend,
  messages,
  markFormSubmitted,
  children,
}: ChatActionsWrapperProps) {
  const { t } = useI18n()

  const submitFormResponse = useCallback(
    async (payload: { formKey: string, title?: string, values: Record<string, string>, labels: Record<string, string> }) => {
      if (isLoading) return
      const header = payload.title || t('chat.agent.tools.askUser.replyHeader')
      const lines = Object.entries(payload.values)
        .filter(([, v]) => v.trim())
        .map(([id, v]) => `${payload.labels[id] || id}: ${v}`)
        .join('\n')
      if (!lines) return

      // formKey = `${messageId}-${partIndex}`，从这里反查 part 的 toolCallId
      const dashIdx = payload.formKey.lastIndexOf('-')
      if (dashIdx > 0) {
        const messageId = payload.formKey.slice(0, dashIdx)
        const partIndexStr = payload.formKey.slice(dashIdx + 1)
        const partIndex = Number.parseInt(partIndexStr, 10)
        if (Number.isFinite(partIndex)) {
          const target = messages.find(m => m.id === messageId)
          const part = (target?.parts || [])[partIndex] as
            | { type?: string, toolCallId?: string }
            | undefined
          if (part?.type?.startsWith('tool-') && part.toolCallId) {
            markFormSubmitted(part.toolCallId, payload.values)
          }
        }
      }

      await onSend(`[${header}]\n${lines}`)
    },
    [isLoading, onSend, t, messages, markFormSubmitted],
  )

  const isFormSubmitted = useCallback((formKey: string) => {
    const dashIdx = formKey.lastIndexOf('-')
    if (dashIdx <= 0) return false
    const messageId = formKey.slice(0, dashIdx)
    const partIndexStr = formKey.slice(dashIdx + 1)
    const partIndex = Number.parseInt(partIndexStr, 10)
    if (!Number.isFinite(partIndex)) return false
    const target = messages.find(m => m.id === messageId)
    const part = (target?.parts || [])[partIndex] as
      | { type?: string, output?: { submitted?: boolean } }
      | undefined
    return Boolean(part?.output?.submitted)
  }, [messages])

  const value = useMemo(() => ({
    submitFormResponse,
    isFormSubmitted,
    isChatLoading: isLoading,
  }), [submitFormResponse, isFormSubmitted, isLoading])

  return <ChatActionsProvider value={value}>{children}</ChatActionsProvider>
}
