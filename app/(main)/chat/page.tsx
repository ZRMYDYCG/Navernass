'use client'

import { ChatInputBox } from './_components/chat-input-box'
import { ChatWelcomeHeader } from './_components/chat-welcome-header'
import { PromptButtons } from './_components/prompt-buttons'

export default function ChatPage() {
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

        <ChatInputBox />

        <PromptButtons />
      </div>
    </div>
  )
}
