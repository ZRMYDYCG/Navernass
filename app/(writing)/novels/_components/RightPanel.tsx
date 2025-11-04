import { Sparkles, Send, MessageSquare, Plus, History, AtSign, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";

type AiMode = "agent" | "ask" | "continue" | "polish";
type AiModel = "gpt-4" | "claude-3.5-sonnet" | "gpt-3.5-turbo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export function RightPanel() {
  const [messages] = useState<Message[]>([]); // 对话消息列表，空数组表示没有对话
  const [mode, setMode] = useState<AiMode>("ask");
  const [model, setModel] = useState<AiModel>("claude-3.5-sonnet");
  const [input, setInput] = useState("");
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const modes = [
    { value: "ask" as const, label: "Ask", icon: MessageSquare },
    { value: "agent" as const, label: "智能体", icon: Sparkles },
    { value: "continue" as const, label: "续写", icon: "✍️" },
    { value: "polish" as const, label: "润色", icon: "✨" },
  ];

  const models = [
    { value: "claude-3.5-sonnet" as const, label: "Claude 3.5 Sonnet" },
    { value: "gpt-4" as const, label: "GPT-4" },
    { value: "gpt-3.5-turbo" as const, label: "GPT-3.5 Turbo" },
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    // TODO: 发送消息
    console.log("发送:", input, "模式:", mode, "模型:", model);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAtClick = () => {
    // TODO: 打开章节选择器
    console.log("引用章节内容");
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
      {/* 顶部标题 */}
      <div className="h-10 flex px-2 items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">AI 助手</h2>
        <div className="flex items-center gap-1">
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="新建对话"
          >
            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
          <button
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title="历史记录"
          >
            <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full p-4">
        {messages.length === 0 ? (
          /* 空状态 - 没有对话 */
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="mb-6 relative">
              {/* AI 图标背景 */}
              <div className="w-20 h-20 rounded-full dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                <Image
                  src="/assets/svg/logo-dark.svg"
                  width={50}
                  height={50}
                  alt="Logo"
                  className="dark:hidden"
                />
                <Image
                  src="/assets/svg/logo-light.svg"
                  width={50}
                  height={50}
                  alt="Logo"
                  className="hidden dark:block"
                />
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              AI 写作助手
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
              我可以帮你续写剧情、优化文字、润色对话，让创作更轻松
            </p>

            {/* 功能卡片 */}
            <div className="w-full max-w-sm space-y-2 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-left border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-blue-600 dark:text-blue-400">✨</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      续写故事
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      根据上下文智能续写
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-left border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-purple-600 dark:text-purple-400">✍️</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      优化润色
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">让文字表达更精彩</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-left border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-green-600 dark:text-green-400">💡</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      创作建议
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      提供专业的写作指导
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              在下方输入框开始对话，或使用快捷键{" "}
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs">
                Ctrl+Shift+A
              </kbd>
            </p>
          </div>
        ) : (
          /* 有对话时显示消息列表 */
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index}>{/* 这里渲染对话消息 */}</div>
            ))}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
        {/* 输入框区域 */}
        <div className="flex gap-2 items-end">
          {/* @ 按钮 */}
          <button
            onClick={handleAtClick}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors border border-gray-200 dark:border-gray-700 flex-shrink-0"
            title="引用章节内容"
          >
            <AtSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>

          {/* 文本输入框 */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="询问 AI 助手..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all resize-none max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
            style={{
              minHeight: "38px",
              height: "auto",
            }}
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white disabled:text-gray-500 rounded-lg transition-colors flex-shrink-0 disabled:cursor-not-allowed"
            title="发送 (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* 工具栏：模式切换 + 模型选择 */}
        <div className="flex items-center gap-2">
          {/* 模式切换下拉菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              {(() => {
                const currentMode = modes.find((m) => m.value === mode);
                const IconComponent = currentMode?.icon;
                return (
                  <>
                    {typeof IconComponent === "string" ? (
                      <span className="text-xs">{IconComponent}</span>
                    ) : IconComponent ? (
                      <IconComponent className="w-3.5 h-3.5" />
                    ) : null}
                    <span className="text-gray-900 dark:text-gray-100">{currentMode?.label}</span>
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </>
                );
              })()}
            </button>
            {showModeMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowModeMenu(false)} />
                <div className="absolute bottom-full mb-1 left-0 z-20 min-w-[140px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                  {modes.map((m) => {
                    const IconComp = m.icon;
                    return (
                      <button
                        key={m.value}
                        onClick={() => {
                          setMode(m.value);
                          setShowModeMenu(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          mode === m.value
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {typeof IconComp === "string" ? (
                          <span className="text-xs">{IconComp}</span>
                        ) : IconComp ? (
                          <IconComp className="w-3.5 h-3.5" />
                        ) : null}
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* 模型选择下拉菜单 */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowModelMenu(!showModelMenu)}
              className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors border border-gray-200 dark:border-gray-700"
            >
              <span className="text-gray-900 dark:text-gray-100 truncate">
                {models.find((m) => m.value === model)?.label}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />
            </button>
            {showModelMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowModelMenu(false)} />
                <div className="absolute bottom-full mb-1 left-0 right-0 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1">
                  {models.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => {
                        setModel(m.value);
                        setShowModelMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        model === m.value
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
