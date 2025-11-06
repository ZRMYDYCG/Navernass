'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { chatApi } from '@/lib/supabase/sdk'
import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { PromptButtons } from './_components/prompt-buttons'

export default function ChatPage() {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending) return

    try {
      setIsSending(true)

      // 直接调用API创建对话并发送消息
      const response = await chatApi.sendMessage({
        message: content.trim(),
      })

      // 使用真实的conversationId导航
      router.push(`/chat/${response.conversationId}`)
    } catch (error) {
      console.error('Failed to send message:', error)
      // TODO: 显示错误提示
    } finally {
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
