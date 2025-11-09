import type { AiMode, AiModel, Message } from './types'
import { useState } from 'react'
import { AtButton } from './at-button'
import { EmptyState } from './empty-state'
import { Header } from './header'
import { InputArea } from './input-area'
import { MessageList } from './message-list'
import { ModeSelector } from './mode-selector'
import { ModelSelector } from './model-selector'
import { SendButton } from './send-button'

export default function RightPanel() {
  const [messages] = useState<Message[]>([]) // 对话消息列表，空数组表示没有对话
  const [mode, setMode] = useState<AiMode>('ask')
  const [model, setModel] = useState<AiModel>('claude-3.5-sonnet')
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    // TODO: 发送消息
    // eslint-disable-next-line no-console
    console.log('发送:', input, '模式:', mode, '模型:', model)
    setInput('')
  }

  const handleAtClick = () => {
    // TODO: 打开章节选择器
    // eslint-disable-next-line no-console
    console.log('引用章节内容')
  }

  const handleNewChat = () => {
    // TODO: 新建对话
    // eslint-disable-next-line no-console
    console.log('新建对话')
  }

  const handleShowHistory = () => {
    // TODO: 显示历史记录
    // eslint-disable-next-line no-console
    console.log('显示历史记录')
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* 顶部标题 */}
      <Header onNewChat={handleNewChat} onShowHistory={handleShowHistory} />

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full p-4">
        {messages.length === 0
          ? (
              <EmptyState />
            )
          : (
              <MessageList messages={messages} />
            )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        <div className="flex gap-2 items-end">
          <InputArea
            value={input}
            onChange={setInput}
            onSend={handleSend}
          />
        </div>

        {/* 工具栏：@ 按钮 + 模式切换 + 模型选择 + 发送按钮 */}
        <div className="flex items-center gap-2">
          <AtButton onClick={handleAtClick} />
          <ModeSelector value={mode} onChange={setMode} />
          <ModelSelector value={model} onChange={setModel} />
          <SendButton onClick={handleSend} disabled={!input.trim()} />
        </div>
      </div>
    </div>
  )
}
