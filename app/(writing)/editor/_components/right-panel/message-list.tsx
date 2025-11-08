import type { Message } from './types'

interface MessageListProps {
  messages: Message[]
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div key={message.id}>{/* TODO: 渲染对话消息 */}</div>
      ))}
    </div>
  )
}
