import type { ChatAreaProps } from '../types';
import { STYLES } from '../config';
import { WelcomeSection } from './WelcomeSection';
import { ChatInput } from './ChatInput';

/**
 * 聊天区域组件
 */
export function ChatArea({
  selectedConversationId,
  messages = [],
}: ChatAreaProps) {
  const handleSendMessage = (message: string) => {
    console.log('发送消息:', message);
  };

  return (
    <section className={STYLES.chatArea.container}>
      {/* 欢迎区域 */}
      <WelcomeSection />

      {/* 消息列表区域 */}
      {selectedConversationId && messages.length > 0 && (
        <div className="flex-1 w-full max-w-3xl overflow-y-auto">
          {/* 消息渲染逻辑 */}
        </div>
      )}

      {/* 输入框 */}
      <ChatInput onSend={handleSendMessage} />
    </section>
  );
}

