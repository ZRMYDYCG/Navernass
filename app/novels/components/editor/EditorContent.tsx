import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { TiptapEditor } from "@/components/tiptap";

interface Tab {
  id: number;
  title: string;
}

interface EditorContentProps {
  openTabs: Tab[];
  activeTab: number;
  onTabChange: (id: number) => void;
  onTabClose: (id: number) => void;
  novelTitle: string;
  chapterTitle: string;
  wordCount: string;
}

export function EditorContent({
  openTabs,
  activeTab,
  onTabChange,
  onTabClose,
  novelTitle,
  chapterTitle,
}: EditorContentProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const handleUpdate = async () => {
    setIsSaving(true);
    // 这里实现保存逻辑
    // TODO: 使用 content 参数保存数据
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    setLastSaved(new Date());
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
        <TiptapEditor
          content={`
            <h1>${chapterTitle}</h1>
            <p>星际殖民地的晨曦透过巨大的圆顶玻璃洒进城市，艾伦站在高塔之上俯瞰着这座人类在遥远星球上建立的最后据点。远处的地平线上，三颗恒星正在缓缓升起，将天空染成了奇异的紫红色。</p>
            <p>"艾伦，我们又收到了来自主星的通讯请求。"身后传来助手的声音，打断了他的思绪。</p>
            <p>他转过身，看着面前这个年轻的女孩。ARIA，一个被设计成拥有完美外表的人工智能助手，却拥有着人类难以企及的计算能力。</p>
            <p>"告诉他们，"艾伦淡淡地说，"我们不需要主星的干涉。这里已经是一个独立的世界了。"</p>
          `}
          placeholder="开始写作..."
          onUpdate={handleUpdate}
          onStatsChange={handleStatsChange}
          autoSave={true}
          autoSaveDelay={3000}
          className="max-w-4xl mx-auto"
          editable={true}
        />
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
