"use client";

import { Search, SwatchBook } from "lucide-react";
import { useTheme } from "next-themes";
import * as Popover from "@radix-ui/react-popover";
import { Moon, Monitor, Sun } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      {/* 左侧：面包屑或标题 */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200"></h2>
      </div>

      {/* 中间 */}
      <div className="flex items-center gap-4">
        {/* 搜索框 */}
        <div className="relative w-64 px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Search className="w-4 h-4" />
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">搜索...</span>
        </div>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-4">
        {/* 主题切换 */}
        <ThemeToggle />
        {/* 头像 - 简化版 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
          U
        </div>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="cursor-pointer border-0 bg-transparent p-0 hover:opacity-70 transition-opacity">
          <SwatchBook className="w-5 h-5" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="popover-content bg-white dark:bg-gray-900 rounded-lg p-3 z-50 focus:outline-none w-[240px] border border-gray-200 dark:border-gray-700"
          sideOffset={8}
          align="end"
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">主题</h3>
          </div>
          <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
                    isActive
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{option.label}</span>
                </button>
              );
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
