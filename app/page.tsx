"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useState } from "react";

interface Conversation {
  id: number;
  title: string;
  time: string;
  createdAt: number;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, title: "第一章情节讨论", time: "2分钟前", createdAt: Date.now() },
  { id: 2, title: "主角性格设定", time: "1小时前", createdAt: Date.now() - 3600000 },
  { id: 3, title: "世界观构建", time: "昨天", createdAt: Date.now() - 86400000 },
];

export default function HomePage() {
  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);

  const handleCreateNew = () => {
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
    <MainLayout>
      <div className="flex h-full bg-white dark:bg-gray-900 transition-colors">
        {/* 左侧对话历史列表 */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={handleCreateNew}
              className="w-full px-4 py-2 bg-black dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
            >
              新建对话
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`p-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer transition-colors ${
                  selectedId === conv.id ? "bg-gray-50 dark:bg-gray-800" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{conv.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{conv.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧 AI 对话区域 */}
        <div className="flex-1 flex flex-col">
          {selectedId ? (
            <>
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">AI 创作助手</h1>
                    <p className="text-gray-600 dark:text-gray-400">开始对话，让我帮助你构思小说情节、设定角色、构建世界观</p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-600"
                    />
                    <button className="px-6 py-2 bg-black dark:bg-gray-800 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors">
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">选择一个对话开始</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
