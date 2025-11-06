'use client'

import type { Message } from './types'
import { useParams, useSearchParams } from 'next/navigation'

import { useEffect, useState } from 'react'
import { ChatInputBox } from '../_components/chat-input-box'
import { ChatWelcomeHeader } from '../_components/chat-welcome-header'
import { MessageList } from './_components/message-list'

export default function ConversationPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)

  const simulateAIResponse = async (userMessage: string) => {
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsLoading(false)
    setIsStreaming(true)

    const aiResponses = [
      `这是一个很有趣的问题！让我来帮你分析一下。

## 关键要点

1. **第一点**：这是第一个重要的观点
2. **第二点**：这是第二个重要的观点
3. **第三点**：这是第三个重要的观点

### 详细说明

你提到的"${userMessage}"让我想到了几个相关的概念：

\`\`\`javascript
function example() {
  console.log("这是一段示例代码");
}
\`\`\`

> 这是一个引用块，用来强调重要信息。

如果你有任何其他问题，随时告诉我！`,
      `关于"${userMessage}"，我有以下建议：

- 首先，你可以考虑从基础开始
- 其次，实践是最好的老师
- 最后，保持耐心和持续学习

这里有一个简单的表格：

| 特性 | 说明 |
|------|------|
| 易用性 | 非常友好 |
| 功能性 | 强大完善 |
| 扩展性 | 灵活可扩展 |

希望这些信息对你有帮助！`,
      `好的，让我用更通俗的方式解释：

**简单来说**，\`${userMessage}\` 是一个值得深入探讨的话题。

### 我的建议

1. 从小处着手
2. 循序渐进
3. 不断实践

你可以参考这些[相关资源](https://github.com)来深入学习。

如果还有疑问，欢迎继续提问！ 😊`,
    ]

    const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: randomResponse,
      timestamp: new Date(),
      status: 'streaming',
    }

    setMessages(prev => [...prev, aiMessage])

    setTimeout(() => {
      setIsStreaming(false)
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessage.id
            ? { ...msg, status: 'sent' }
            : msg,
        ),
      )
    }, randomResponse.length * 30 + 500)
  }

  const handleSendMessage = async (content: string) => {
    if (!content.trim())
      return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages(prev => [...prev, userMessage])

    await simulateAIResponse(content.trim())
  }

  useEffect(() => {
    const loadConversation = async () => {
      // 检查是否有从 URL 参数传递的第一条消息
      const initialMessage = searchParams.get('message')

      if (initialMessage) {
        try {
          // 解码消息
          const decodedMessage = decodeURIComponent(atob(initialMessage))

          const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: decodedMessage,
            timestamp: new Date(),
            status: 'sent',
          }

          setMessages([userMessage])

          // 自动触发 AI 响应
          simulateAIResponse(decodedMessage)
        } catch (error) {
          console.error('Failed to decode initial message:', error)
          setMessages([])
        }
      } else {
        // TODO: 从 API 加载历史消息
        setMessages([])
      }
    }

    loadConversation()
  }, [conversationId, searchParams])

  return (
    <div className="flex flex-col h-full">
      <ChatWelcomeHeader />

      {/* 消息列表区域 */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
        />
      </div>

      {/* 输入框区域 */}
      <div className="mb-3">
        <ChatInputBox onSend={handleSendMessage} />
      </div>
    </div>
  )
}
