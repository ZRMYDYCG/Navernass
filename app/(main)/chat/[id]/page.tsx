'use client'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'

export default function ConversationPage() {
  return (
    <div className="flex flex-col h-full ">
      <ChatWelcomeHeader />

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-y-auto">
      </div>

      {/* 输入框区域 */}
      <div className="mb-3">
        <ChatInputBox />
      </div>
    </div>
  )
}
