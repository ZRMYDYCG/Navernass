'use client'

import { useRouter } from 'next/navigation'
import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { PromptButtons } from './_components/prompt-buttons'

export default function ChatPage() {
  const router = useRouter()

  const handleSendMessage = (content: string) => {
    const conversationId = Date.now().toString()
    // 将消息内容编码为 base64 并作为 URL 参数传递
    const encodedMessage = btoa(encodeURIComponent(content))
    router.push(`/chat/${conversationId}?message=${encodedMessage}`)
  }

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            晚上好，一勺
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            开始创作你的故事吧
          </p>
        </div>

        <ChatInputBox onSend={handleSendMessage} />

        <PromptButtons />
      </div>
    </div>
  )
}
