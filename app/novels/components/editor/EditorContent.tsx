import { useState, useEffect } from "react";
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

  // 加载章节内容
  useEffect(() => {
    if (!chapterId) return;

    const loadChapter = async () => {
      try {
        setLoading(true);
        const data = await chaptersApi.getById(chapterId);
        setChapter(data);
      } catch (error) {
        console.error("加载章节失败:", error);
        const message = error instanceof Error ? error.message : "加载章节失败";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [chapterId]);

  const handleUpdate = async (content: string) => {
    if (!chapterId) return;

    try {
      setIsSaving(true);
      await chaptersApi.update(chapterId, { content });
      setLastSaved(new Date());
    } catch (error) {
      console.error("保存失败:", error);
      const message = error instanceof Error ? error.message : "保存失败";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatsChange = (stats: { words: number; characters: number }) => {
    setWordCount(stats.words);
    setCharCount(stats.characters);
  };

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
