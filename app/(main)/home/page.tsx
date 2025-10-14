"use client";

import { useState } from "react";
import { ConversationList, ChatArea } from "./components";
import { MOCK_CONVERSATIONS } from "./config";
import type { Conversation } from "./types";

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  /**
   * 选择对话
   */
  const handleSelectConversation = (id: number) => {
    setSelectedId(id);
  };

  /**
   * 创建新对话
   */
  const handleCreateNewConversation = () => {
    const newId = Math.max(...conversations.map((c) => c.id)) + 1;
    const newConversation: Conversation = {
      id: newId,
      title: "新对话",
      time: "刚刚",
      createdAt: Date.now(),
    };

    setConversations([newConversation, ...conversations]);
    setSelectedId(newId);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* 左侧对话历史列表 */}
      <ConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelectConversation}
        onCreateNew={handleCreateNewConversation}
      />

      {/* 右侧 AI 对话区域 */}
      <ChatArea selectedConversationId={selectedId} />
    </div>
  );
}
