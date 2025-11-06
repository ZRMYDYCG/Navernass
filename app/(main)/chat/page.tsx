'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { chatApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { PromptButtons } from './_components/prompt-buttons'

export default function ChatPage() {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return

    setIsSending(true)

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // 先开始流式请求，等待获取 conversation_id
      await chatApi.sendMessageStream(
        {
          message: content.trim(),
        },
        {
          onConversationId: (id) => {
            // 🎯 获取到对话ID后，立即跳转并传递消息
            sessionStorage.setItem('newChatMessage', content.trim())
            sessionStorage.setItem('newConversationId', id)
            router.push(`/chat/${id}`)
          },
          onError: (error) => {
            console.error('Failed to create conversation:', error)
            setIsSending(false)
          },
        },
      )
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            晚上好，一勺
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            开始创作你的故事吧
          </p>
        </div>

        <ChatInputBox onSend={handleSendMessage} />

        <PromptButtons onPromptClick={handleSendMessage} />
      </div>
    </div>
  )
}
