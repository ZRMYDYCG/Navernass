"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownUp, Search, X } from "lucide-react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useEffect, useState } from "react";
import { AvatarSection } from "./components/avatarSection";
import { ThemeSection } from "./components/themeSection";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  // 监听 Ctrl+K 快捷键
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      {/* 左侧：面包屑或标题 */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200"></h2>
      </div>

      {/* 中间 */}
      <div className="flex items-center gap-4">
        {/* 搜索框 */}
        <div
          onClick={() => setSearchOpen(true)}
          className="relative w-64 px-4 py-2 pl-10 pr-16 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">搜索...</span>
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <KbdGroup>
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </div>
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-4">
        {/* 主题 */}
        <ThemeSection />
        {/* 头像 */}
        <AvatarSection />
      </div>

      {/* 搜索对话框 */}
      <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 animate-in fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
              {/* 搜索输入框 */}
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="flex-1 px-4 py-4 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* 搜索结果区域 */}
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p className="text-sm">输入关键词开始搜索</p>
                </div>
              </div>

              {/* 底部提示 */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <KbdGroup>
                      <Kbd>
                        <ArrowDownUp className="w-4 h-4" />
                      </Kbd>
                    </KbdGroup>
                    <span>导航</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>Enter</Kbd>
                    <span>选择</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Kbd>Esc</Kbd>
                    <span>关闭</span>
                  </div>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </header>
  );
}
