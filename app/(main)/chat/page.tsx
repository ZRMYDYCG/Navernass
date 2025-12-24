'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { chatApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcome } from './_components/chat-welcome'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { PromptButtons } from './_components/prompt-buttons'

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSending, setIsSending] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const initialMessage = searchParams.get('message')

  useEffect(() => {
    if (initialMessage) {
      handleSendMessage(initialMessage)
    }
  }, [initialMessage])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return

    setIsSending(true)

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const conversation = await chatApi.createConversation(content.trim())
      router.push(`/chat/${conversation.id}?message=${encodeURIComponent(content.trim())}`)
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <ChatWelcomeHeader />

      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
          <ChatWelcome isLoading={isSending} />

          <div className="w-full space-y-4">
            <ChatInputBox onSend={handleSendMessage} disabled={isSending} />
            <PromptButtons onPromptClick={handleSendMessage} disabled={isSending} />
          </div>
        </div>
      </div>
    </div>
  )
}
