"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as Dialog from "@radix-ui/react-dialog";
import EditorHeader from "./_components/editor-header";
import LeftPanel from "./_components/left-panel";
import EditorContent from "./_components/editor-content";
import RightPanel from "./_components/right-panel";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import { novelsApi, chaptersApi, type Novel, type Chapter } from "@/lib/supabase/sdk";
import { toast } from "sonner";

export default function NovelsEdit() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const novelId = searchParams.get("id");

  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [openTabs, setOpenTabs] = useState<Array<{ id: string; title: string }>>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [createChapterDialogOpen, setCreateChapterDialogOpen] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [isCreatingChapter, setIsCreatingChapter] = useState(false);

  // 加载小说和章节数据
  useEffect(() => {
    if (!novelId) {
      toast.error("缺少小说ID");
      router.push("/novels");
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const [novelData, chaptersData] = await Promise.all([
          novelsApi.getById(novelId),
          chaptersApi.getByNovelId(novelId),
        ]);
        setNovel(novelData);
        setChapters(chaptersData);
      } catch (error) {
        console.error("加载数据失败:", error);
        const message = error instanceof Error ? error.message : "加载数据失败";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [novelId, router]);

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
  const handleSelectChapter = (chapterId: string) => {
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

  const closeTab = (tabId: string) => {
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

  // 打开创建章节对话框
  const handleOpenCreateChapterDialog = () => {
    setNewChapterTitle("");
    setCreateChapterDialogOpen(true);
  };

  // 创建新章节
  const handleCreateChapter = async () => {
    if (!novelId) return;
    if (!newChapterTitle.trim()) {
      toast.error("请输入章节标题");
      return;
    }

    try {
      setIsCreatingChapter(true);
      const newChapter = await chaptersApi.create({
        novel_id: novelId,
        title: newChapterTitle.trim(),
        order_index: chapters.length,
        content: "",
      });

      toast.success("章节创建成功！");
      setCreateChapterDialogOpen(false);

      // 重新加载章节列表
      const updatedChapters = await chaptersApi.getByNovelId(novelId);
      setChapters(updatedChapters);

      // 自动打开新创建的章节
      handleSelectChapter(newChapter.id);
    } catch (error) {
      console.error("创建章节失败:", error);
      const message = error instanceof Error ? error.message : "创建章节失败";
      toast.error(message);
    } finally {
      setIsCreatingChapter(false);
    }
  };

  // 创建卷（暂未实现）
  const handleCreateVolume = () => {
    toast.info("卷功能即将推出！");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">小说不存在</div>
      </div>
    );
  }

  // 格式化章节数据以适配组件
  const formattedChapters = chapters.map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    wordCount: `${(chapter.word_count / 1000).toFixed(1)}k字`,
    status: chapter.status === "published" ? "已发布" : "草稿",
  }));

  return (
    <Tooltip.Provider>
      <div className="h-screen flex flex-col overflow-hidden">
        <EditorHeader
          novelTitle={`《${novel.title}》`}
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
                  <LeftPanel
                    chapters={formattedChapters}
                    selectedChapter={selectedChapter}
                    onSelectChapter={handleSelectChapter}
                    onCreateChapter={handleOpenCreateChapterDialog}
                    onCreateVolume={handleCreateVolume}
                  />
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
                    <Image
                      src="/assets/svg/logo-eye.svg"
                      width={120}
                      height={120}
                      alt="Logo"
                      className="opacity-40"
                    />
                    <p className="text-sm">选择一个章节开始编辑</p>
                    <span className="flex items-center gap-1">
                      <Kbd>Ctrl</Kbd>
                      <Kbd>+</Kbd>
                      <Kbd>S</Kbd>
                      <span>保存内容</span>
                    </span>
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
                  novelTitle={novel.title}
                  chapterTitle={chapters.find((c) => c.id === activeTab)?.title || ""}
                  chapterId={activeTab}
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

        {/* 创建章节对话框 */}
        <Dialog.Root open={createChapterDialogOpen} onOpenChange={setCreateChapterDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in-0" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  创建新章节
                </Dialog.Title>

                <div className="space-y-4">
                  {/* 标题输入 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      章节标题 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      placeholder="例如：第一章 新的开始"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleCreateChapter();
                        }
                      }}
                    />
                  </div>
                </div>

                {/* 按钮组 */}
                <div className="flex gap-3 mt-6">
                  <Dialog.Close asChild>
                    <Button
                      type="button"
                      className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
                      disabled={isCreatingChapter}
                    >
                      取消
                    </Button>
                  </Dialog.Close>
                  <Button
                    onClick={handleCreateChapter}
                    className="flex-1 bg-black dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                    disabled={isCreatingChapter || !newChapterTitle.trim()}
                  >
                    {isCreatingChapter ? "创建中..." : "创建"}
                  </Button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Tooltip.Provider>
  );
}
