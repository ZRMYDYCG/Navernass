"use client";

import { useState, useEffect, useCallback } from "react";
import { ConversationList, ChatArea } from "./components";
import type { Conversation, Message } from "./types";
import { conversationsApi, messagesApi } from "@/lib/api";
import { toast } from "sonner";

// 计算相对时间文本
function getTimeText(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "刚刚";
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  return date.toLocaleDateString();
}

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // 加载对话列表
  const loadConversations = useCallback(async () => {
    try {
      const result = await conversationsApi.getList({
        page: 1,
        pageSize: 50,
      });

      // 添加时间文本
      const conversationsWithTime = (result?.data || []).map((conv) => ({
        ...conv,
        timeText: getTimeText(conv.updated_at),
      }));

      setConversations(conversationsWithTime);

      // 如果有对话但没有选中的，自动选中第一个
      if (conversationsWithTime.length > 0 && !selectedId) {
        setSelectedId(conversationsWithTime[0].id);
      }
    } catch (error) {
      console.error("加载对话列表失败:", error);
      const message = error instanceof Error ? error.message : "加载对话列表失败";
      toast.error(message);
      setConversations([]); // 出错时设置为空数组
    }
  }, [selectedId]);

  // 加载消息列表
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const msgs = await messagesApi.getByConversationId(conversationId, {
        page: 1,
        pageSize: 100,
      });
      setMessages(msgs?.data || []);
    } catch (error) {
      console.error("加载消息失败:", error);
      const message = error instanceof Error ? error.message : "加载消息失败";
      toast.error(message);
      setMessages([]); // 出错时设置为空数组
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // 初始加载对话列表
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // 当选中对话时，加载消息
  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
    } else {
      setMessages([]);
    }
  }, [selectedId, loadMessages]);

  /**
   * 选择对话
   */
  const handleSelectConversation = (id: string) => {
    setSelectedId(id);
  };

  /**
   * 创建新对话
   */
  const handleCreateNewConversation = async () => {
    try {
      const newConversation = await conversationsApi.create({
        title: "新对话",
      });

      toast.success("创建对话成功！");

      // 重新加载对话列表
      await loadConversations();

      // 选中新创建的对话
      setSelectedId(newConversation.id);
    } catch (error) {
      console.error("创建对话失败:", error);
      const message = error instanceof Error ? error.message : "创建对话失败";
      toast.error(message);
    }
  };

  /**
   * 发送消息
   */
  const handleSendMessage = async (content: string) => {
    if (!selectedId) {
      toast.error("请先选择一个对话");
      return;
    }

    try {
      // 创建用户消息
      await messagesApi.create({
        conversation_id: selectedId,
        role: "user",
        content,
      });

      // TODO: 这里应该调用 AI 接口获取回复
      // 暂时创建一个模拟的 AI 回复
      await messagesApi.create({
        conversation_id: selectedId,
        role: "assistant",
        content: "这是 AI 的回复（待实现）",
      });

      // 重新加载消息列表
      await loadMessages(selectedId);

      // 更新对话的 updated_at 时间
      await conversationsApi.update(selectedId, {
        title: conversations.find((c) => c.id === selectedId)?.title || "新对话",
      });

      // 重新加载对话列表以更新时间
      await loadConversations();
    } catch (error) {
      console.error("发送消息失败:", error);
      const message = error instanceof Error ? error.message : "发送消息失败";
      toast.error(message);
    }
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
      <ChatArea
        selectedConversationId={selectedId}
        messages={messages}
        onSendMessage={handleSendMessage}
        loading={messagesLoading}
      />
    </div>
  );
}
