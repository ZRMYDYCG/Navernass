"use client";

import { useState, useEffect } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import * as Tooltip from "@radix-ui/react-tooltip";
import { EditorHeader, LeftPanel, EditorContent, RightPanel } from "@/app/(main)/novels/components/editor";
import { Icon } from "@/components/ui/icon";
import { Kbd } from "@/components/ui/kbd";

// 章节数据
const chapters = [
  { id: 1, title: "第一章：新的征程", wordCount: "3.2k字", status: "已发布" },
  { id: 2, title: "第二章：又见旧识", wordCount: "2.8k字", status: "草稿" },
  { id: 3, title: "第三章：诡异与智慧", wordCount: "4.1k字", status: "草稿" },
];

export default function NovelsEdit() {
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [openTabs, setOpenTabs] = useState<Array<{ id: number; title: string }>>([]);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // 键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+E 切换左侧面板
      if (e.ctrlKey && e.key === "e") {
        e.preventDefault();
        setShowLeftPanel((prev) => !prev);
      }
      // Ctrl+L 切换右侧面板
      if (e.ctrlKey && e.key === "l") {
        e.preventDefault();
        setShowRightPanel((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 处理章节选择
  const handleSelectChapter = (chapterId: number) => {
    const chapter = chapters.find((c) => c.id === chapterId);
    if (!chapter) return;

    setSelectedChapter(chapterId);

    // 如果该章节不在已打开的标签页中，添加它
    if (!openTabs.find((tab) => tab.id === chapterId)) {
      setOpenTabs([...openTabs, { id: chapter.id, title: chapter.title }]);
    }

    // 设置为当前活动标签
    setActiveTab(chapterId);
  };

  const closeTab = (tabId: number) => {
    const newTabs = openTabs.filter((tab) => tab.id !== tabId);
    setOpenTabs(newTabs);
    if (activeTab === tabId) {
      if (newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
        setSelectedChapter(newTabs[newTabs.length - 1].id);
      } else {
        setActiveTab(null);
        setSelectedChapter(null);
      }
    }
  };

  return (
    <Tooltip.Provider>
      <div className="h-screen flex flex-col overflow-hidden">
        <EditorHeader
          novelTitle="《星际迷航：无尽边界》"
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
          onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
          onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
        />

        {/* 主题内容区域 */}
        <main className="flex-1 bg-white dark:bg-gray-900 transition-colors overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* 左侧：带Tab的侧边栏 */}
            {showLeftPanel && (
              <>
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <LeftPanel chapters={chapters} selectedChapter={selectedChapter} onSelectChapter={handleSelectChapter} />
                </ResizablePanel>

                <ResizableHandle withHandle />
              </>
            )}

            {/* 中间：编辑器 */}
            <ResizablePanel defaultSize={60} minSize={40}>
              {selectedChapter === null || activeTab === null ? (
                // 未选择章节时显示欢迎界面
                <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900">
                  <div className="flex flex-col items-center gap-6 text-gray-400 dark:text-gray-600">
                    <Icon name="logo-eye" size={120} className="opacity-40" />
                    <p className="text-sm">选择一个章节开始编辑</p>
                    <span className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <Kbd>+</Kbd>
                      <Kbd>E</Kbd>
                      <span>切换左侧面板</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <Kbd>+</Kbd>
                      <Kbd>L</Kbd>
                      <span>切换右侧面板</span>
                    </span>
                  </div>
                </div>
              ) : (
                // 选择章节后显示编辑器
                <EditorContent
                  openTabs={openTabs}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onTabClose={closeTab}
                  novelTitle="星际迷航：无尽边界"
                  chapterTitle={chapters.find((c) => c.id === activeTab)?.title || "第一章：新的征程"}
                  wordCount="3,245"
                />
              )}
            </ResizablePanel>

            {showRightPanel && (
              <>
                <ResizableHandle withHandle />

                {/* 右侧：AI助手 */}
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <RightPanel />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>
      </div>
    </Tooltip.Provider>
  );
}
