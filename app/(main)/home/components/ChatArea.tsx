import type { ChatAreaProps } from "../types";
import { STYLES } from "../config";
import { WelcomeSection } from "./WelcomeSection";
import { ChatInput } from "./ChatInput";
import { User, Bot } from "lucide-react";

/**
 * 聊天区域组件
 */
export function ChatArea({
  selectedConversationId,
  messages = [],
  onSendMessage,
  loading = false,
}: ChatAreaProps) {
  const handleSendMessage = (message: string) => {
    onSendMessage?.(message);
  };

  return (
    <section className={STYLES.chatArea.container}>
      {/* 显示消息或欢迎区域 */}
      {!selectedConversationId || !messages || messages.length === 0 ? (
        <WelcomeSection />
      ) : (
        <div className="flex-1 w-full max-w-3xl overflow-y-auto mb-8 space-y-4">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <div className="text-gray-500 dark:text-gray-400">加载中...</div>
            </div>
          ) : (
            messages &&
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-black dark:bg-gray-700 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 输入框 */}
      <ChatInput onSend={handleSendMessage} disabled={!selectedConversationId} />
    </section>
  );
}
