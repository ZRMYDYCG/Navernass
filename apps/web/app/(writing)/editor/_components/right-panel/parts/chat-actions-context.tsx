'use client'

import { createContext, useContext } from 'react'

export interface FormSubmitPayload {
  formKey: string
  title?: string
  values: Record<string, string>
  labels: Record<string, string>
}

interface ChatActionsContextValue {
  submitFormResponse: (payload: FormSubmitPayload) => Promise<void>
  isFormSubmitted: (formKey: string) => boolean
  isChatLoading: boolean
}

const ChatActionsContext = createContext<ChatActionsContextValue | null>(null)

export function ChatActionsProvider({
  children,
  value,
}: {
  children: React.ReactNode
  value: ChatActionsContextValue
}) {
  return (
    <ChatActionsContext.Provider value={value}>
      {children}
    </ChatActionsContext.Provider>
  )
}

export function useChatActions() {
  return useContext(ChatActionsContext)
}
