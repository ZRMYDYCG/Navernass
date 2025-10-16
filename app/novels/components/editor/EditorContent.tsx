import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronRight } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap";
import { chaptersApi, type Chapter } from "@/lib/api";
import { toast } from "sonner";

interface Tab {
  id: string;
  title: string;
}

interface EditorContentProps {
  openTabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  novelTitle: string;
  chapterTitle: string;
  chapterId: string;
}

export function EditorContent({
  openTabs,
  activeTab,
  onTabChange,
  onTabClose,
  novelTitle,
  chapterTitle,
  chapterId,
}: EditorContentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const editorContentRef = useRef<string>("");
  const isSavingRef = useRef(false);

  // 加载章节内容
  useEffect(() => {
    if (!chapterId) return;

    // 重置状态
    setLastSaved(null);
    editorContentRef.current = "";

    const loadChapter = async () => {
      try {
        setLoading(true);
        console.log("📖 开始加载章节:", chapterId);
        const data = await chaptersApi.getById(chapterId);
        console.log("✅ 章节加载成功:", {
          chapterId: data.id,
          title: data.title,
          contentLength: data.content?.length || 0,
          wordCount: data.word_count,
        });
        setChapter(data);
        editorContentRef.current = data.content; // 初始化 ref
      } catch (error) {
        console.error("❌ 加载章节失败:", error);
        const message = error instanceof Error ? error.message : "加载章节失败";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [chapterId]);

  const handleUpdate = async (content: string) => {
    editorContentRef.current = content;
    console.log("🔄 自动保存触发:", { chapterId, contentLength: content?.length || 0 });
    if (!chapterId) return;

    try {
      setIsSaving(true);
      await chaptersApi.update({ id: chapterId, content });
      // 更新本地 chapter state，确保切换章节后能加载最新内容
      setChapter((prev) => (prev ? { ...prev, content } : null));
      setLastSaved(new Date());
      console.log("✅ 自动保存完成");
    } catch (error) {
      console.error("❌ 保存失败:", error);
      const message = error instanceof Error ? error.message : "保存失败";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // 手动保存
  const handleManualSave = useCallback(async () => {
    if (!chapterId || isSavingRef.current) return;

    try {
      isSavingRef.current = true;
      setIsSaving(true);
      const content = editorContentRef.current;
      console.log("💾 手动保存触发 (Ctrl+S):", { chapterId, contentLength: content?.length || 0 });
      await chaptersApi.update({
        id: chapterId,
        content,
      });
      // 更新本地 chapter state，确保切换章节后能加载最新内容
      setChapter((prev) => (prev ? { ...prev, content } : null));
      setLastSaved(new Date());
      console.log("✅ 手动保存完成");
      toast.success("保存成功", { duration: 1500 });
    } catch (error) {
      console.error("❌ 手动保存失败:", error);
      const message = error instanceof Error ? error.message : "保存失败";
      toast.error(message);
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  }, [chapterId]);

  const handleStatsChange = (stats: { words: number; characters: number }) => {
    setWordCount(stats.words);
    setCharCount(stats.characters);
  };

  // 监听 Ctrl+S 快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) 或 Cmd+S (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleManualSave]);

  // 页面刷新前提醒保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 如果正在保存或者最近刚保存过（5秒内），则不提示
      const timeSinceLastSave = lastSaved ? Date.now() - lastSaved.getTime() : Infinity;
      if (isSaving || timeSinceLastSave < 5000) {
        return;
      }

      // 如果有未保存的内容，提示用户
      e.preventDefault();
      e.returnValue = "您有未保存的内容，确定要离开吗？";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSaving, lastSaved]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* 顶部页签区域 */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        {openTabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`group flex items-center gap-2 px-4 py-2.5 border-r border-gray-200 dark:border-gray-800 cursor-pointer transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
            }`}
          >
            <span className="text-sm truncate max-w-[150px]">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* 编辑器内容区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500 dark:text-gray-400">加载中...</div>
          </div>
        ) : (
          <TiptapEditor
            key={chapterId}
            content={chapter?.content || `<h1>${chapterTitle}</h1><p>开始写作...</p>`}
            placeholder="开始写作..."
            onUpdate={handleUpdate}
            onStatsChange={handleStatsChange}
            autoSave={true}
            autoSaveDelay={3000}
            className="max-w-4xl mx-auto"
            editable={true}
          />
        )}
      </div>

      {/* 底部状态栏 */}
      <div className="h-10 px-6 flex items-center justify-between border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{novelTitle}</span>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-700 dark:text-gray-300">{chapterTitle}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span>字数：{wordCount.toLocaleString()}</span>
          <span>•</span>
          <span>字符：{charCount.toLocaleString()}</span>
          <span>•</span>
          {isSaving ? (
            <span className="text-blue-600 dark:text-blue-400">保存中...</span>
          ) : lastSaved ? (
            <span>已保存</span>
          ) : (
            <span>未保存</span>
          )}
        </div>
      </div>
    </div>
  );
}
