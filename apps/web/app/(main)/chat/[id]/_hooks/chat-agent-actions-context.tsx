'use client'

import { createContext, useContext } from 'react'

export interface ChatAgentActions {
  acceptNovelProposal: (
    toolCallId: string,
    payload: { title: string, description?: string, category?: string, tags?: string[], summary?: string },
  ) => Promise<void>
  acceptCharacterProposal: (
    toolCallId: string,
    payload: { novelId: string, name: string, role?: string, description?: string, traits?: string[], keywords?: string[] },
  ) => Promise<void>
  acceptOutlineProposal: (
    toolCallId: string,
    payload: { novelId: string, title: string, content?: string, volumeId?: string, parentId?: string },
  ) => Promise<void>
  rejectProposal: (toolCallId: string) => void
  /**
   * 把 ask_user 表单对应的 part 标记为已提交，并写入用户填的值。
   * 同步落库：刷新后 formKey 对应的 part 仍会显示已提交。
   *
   * 客户端 caller 传入 partKey（chat part 的稳定 key），hook 内部按 formKey 拆出 messageId / partIndex。
   */
  markFormSubmitted: (
    toolCallId: string,
    submittedValues: Record<string, string>,
  ) => void
}

const ChatAgentActionsContext = createContext<ChatAgentActions | null>(null)

export const ChatAgentActionsProvider = ChatAgentActionsContext.Provider

export function useChatAgentActions(): ChatAgentActions {
  const ctx = useContext(ChatAgentActionsContext)
  if (!ctx) {
    throw new Error('useChatAgentActions must be used within ChatAgentActionsProvider')
  }
  return ctx
}
