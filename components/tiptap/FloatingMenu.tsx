import { useEffect, useState } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Sparkles,
} from "lucide-react";
import type { Editor } from "@tiptap/react";

interface FloatingMenuProps {
  editor: Editor | null;
}

export function FloatingMenu({ editor }: FloatingMenuProps) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAskAI, setShowAskAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);

  // 常用颜色
  const colors = [
    { name: "黑色", value: "#000000" },
    { name: "红色", value: "#EF4444" },
    { name: "橙色", value: "#F97316" },
    { name: "黄色", value: "#EAB308" },
    { name: "绿色", value: "#22C55E" },
    { name: "蓝色", value: "#3B82F6" },
    { name: "紫色", value: "#A855F7" },
    { name: "粉色", value: "#EC4899" },
  ];

  // 处理 Ask AI
  const handleAskAI = async () => {
    if (!editor || !aiPrompt.trim()) return;

    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " "
    );

    if (!selectedText) return;

    try {
      setIsAILoading(true);

      // TODO: 这里集成您的 AI API
      // 示例：调用 AI 服务处理文本
      // const result = await fetch('/api/ai/process', {
      //   method: 'POST',
      //   body: JSON.stringify({ text: selectedText, prompt: aiPrompt })
      // });

      // 模拟 AI 响应（替换为实际 API 调用）
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const aiResponse = `[AI处理结果] ${selectedText}`;

      // 替换选中的文本
      editor.chain().focus().insertContent(aiResponse).run();

      setAiPrompt("");
      setShowAskAI(false);
    } catch (error) {
      console.error("AI 处理失败:", error);
    } finally {
      setIsAILoading(false);
    }
  };

  useEffect(() => {
    if (!editor) return;

    const updateMenu = () => {
      const { from, to } = editor.state.selection;
      const hasSelection = from !== to;

      if (!hasSelection) {
        setShow(false);
        setShowColorPicker(false);
        setShowAskAI(false);
        return;
      }

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const rect = selection.getRangeAt(0).getBoundingClientRect();
        if (rect) {
          setPosition({
            top: rect.top - 50,
            left: rect.left + rect.width / 2,
          });
          setShow(true);
        }
      }
    };

    editor.on("selectionUpdate", updateMenu);
    editor.on("update", updateMenu);

    return () => {
      editor.off("selectionUpdate", updateMenu);
      editor.off("update", updateMenu);
    };
  }, [editor]);

  if (!show || !editor) return null;

  return (
    <>
      {/* 主工具栏 */}
      <div
        style={{
          position: "fixed",
          top: `${position.top}px`,
          left: `${position.left}px`,
          transform: "translateX(-50%)",
          zIndex: 50,
        }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("bold")
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="加粗"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("italic")
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="斜体"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("underline")
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="下划线"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="标题 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="标题 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              editor.isActive("heading", { level: 3 })
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="标题 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* 文字颜色按钮 */}
          <div className="relative">
            <button
              onClick={() => {
                setShowColorPicker(!showColorPicker);
                setShowAskAI(false);
              }}
              className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                showColorPicker
                  ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
              title="文字颜色"
            >
              <Palette className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* Ask AI 按钮 */}
          <button
            onClick={() => {
              setShowAskAI(!showAskAI);
              setShowColorPicker(false);
            }}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              showAskAI
                ? "bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400"
                : "text-gray-700 dark:text-gray-300"
            }`}
            title="Ask AI"
          >
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

        {/* 颜色选择器面板 */}
        {showColorPicker && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2">
            <div className="grid grid-cols-4 gap-2">
              {colors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    editor.chain().focus().setColor(color.value).run();
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
              {/* 清除颜色 */}
              <button
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform bg-white dark:bg-gray-700 flex items-center justify-center text-xs"
                title="清除颜色"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Ask AI 面板 */}
        {showAskAI && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-80">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Ask AI</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              选中文本后，告诉 AI 你想做什么
            </p>
            <div className="space-y-2">
              {/* 快捷操作 */}
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setAiPrompt("润色这段文字")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  润色
                </button>
                <button
                  onClick={() => setAiPrompt("扩写这段内容")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  扩写
                </button>
                <button
                  onClick={() => setAiPrompt("缩写这段内容")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  缩写
                </button>
                <button
                  onClick={() => setAiPrompt("翻译成英文")}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  翻译
                </button>
              </div>
              {/* 输入框 */}
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskAI();
                  }
                }}
                placeholder="输入你的指令..."
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                autoFocus
              />
              {/* 按钮组 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAskAI(false);
                    setAiPrompt("");
                  }}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAskAI}
                  disabled={!aiPrompt.trim() || isAILoading}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAILoading ? "处理中..." : "发送"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
