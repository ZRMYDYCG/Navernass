"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Bot, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const menuItems = [
    { path: "/home", label: "新建对话", icon: Bot },
    { path: "/novels", label: "我的小说", icon: Book },
    { path: "/trash", label: "回收站", icon: Trash2 },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <Tooltip.Provider delayDuration={150}>
      <aside
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isVisible ? "pb-4" : "pb-0 translate-y-[calc(100%-3rem)]"
        }`}
      >
        {/* 切换按钮 - 精致设计 */}
        <div className="flex justify-center mb-1.5">
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="group relative bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-t border-x border-white/40 dark:border-gray-700/40 rounded-t-[20px] px-6 py-2.5 hover:py-3 transition-all duration-300 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_-6px_30px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_-6px_30px_rgba(0,0,0,0.4)]"
            aria-label={isVisible ? "隐藏导航栏" : "显示导航栏"}
          >
            {/* 顶部高光 */}
            <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />

            <div className="relative flex items-center justify-center">
              {isVisible ? (
                <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:scale-110" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-all duration-300 group-hover:scale-110" />
              )}
            </div>
          </button>
        </div>

        {/* macOS Dock - 精致版本 */}
        <div
          className={`relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isVisible
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-full opacity-0 scale-90 pointer-events-none"
          }`}
        >
          {/* Dock 容器 */}
          <div className="relative bg-white/85 dark:bg-gray-900/85 backdrop-blur-3xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.5)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.6),0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] border border-white/30 dark:border-gray-700/30">
            {/* 顶部高光条 */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/70 dark:via-white/20 to-transparent rounded-t-[28px]" />

            {/* 内容区域 */}
            <div className="relative px-5 py-4">
              {/* 导航菜单 */}
              <nav className="flex items-center gap-3">
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isTrash = item.path === "/trash";

                  return (
                    <Tooltip.Root key={item.path}>
                      <Tooltip.Trigger asChild>
                        <Link
                          href={item.path}
                          className={`group relative flex items-center justify-center w-[68px] h-[68px] rounded-[22px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                            active
                              ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white text-white dark:text-gray-900 shadow-[0_8px_24px_rgba(0,0,0,0.25),0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)] dark:shadow-[0_8px_24px_rgba(255,255,255,0.3),0_2px_8px_rgba(255,255,255,0.2)] scale-[1.15] -translate-y-1"
                              : "text-gray-600 dark:text-gray-400 hover:scale-[1.2] hover:-translate-y-3 active:scale-95"
                          }`}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                        >
                          {/* 背景光晕 - 仅在激活时显示 */}
                          {active && (
                            <>
                              <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-white/20 to-transparent" />
                              <div className="absolute -inset-1 rounded-[24px] bg-gradient-to-br from-gray-900/20 dark:from-white/20 to-transparent blur-md -z-10" />
                            </>
                          )}

                          {/* Hover 背景 */}
                          {!active && (
                            <div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-gray-100/0 to-gray-100/0 dark:from-gray-800/0 dark:to-gray-800/0 group-hover:from-gray-100/90 group-hover:to-gray-50/90 dark:group-hover:from-gray-800/90 dark:group-hover:to-gray-700/90 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100" />
                          )}

                          {/* 图标 */}
                          <Icon
                            className={`relative z-10 w-8 h-8 transition-all duration-300 ${
                              active
                                ? "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] scale-105"
                                : isTrash && !active
                                  ? "text-red-500 dark:text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:scale-110 group-hover:drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]"
                                  : "group-hover:text-gray-900 dark:group-hover:text-gray-100 group-hover:scale-110 group-hover:drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                            }`}
                          />

                          {/* 活跃指示器 - Dock 风格圆点 */}
                          {active && (
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                              <div className="w-1 h-1 bg-white dark:bg-gray-900 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.3)]" />
                            </div>
                          )}

                          {/* Hover 反光效果 */}
                          <div className="absolute inset-0 rounded-[22px] bg-gradient-to-t from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-white/20 dark:group-hover:via-white/5 dark:group-hover:to-white/10 transition-all duration-300 pointer-events-none" />
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          className="bg-gray-900/98 dark:bg-gray-800/98 backdrop-blur-xl text-white text-[13px] font-medium px-4 py-2.5 rounded-[14px] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)] border border-gray-700/50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
                          sideOffset={16}
                        >
                          {item.label}
                          <Tooltip.Arrow className="fill-gray-900/98 dark:fill-gray-800/98" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </nav>
            </div>

            {/* 底部反光 */}
            <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-black/10 dark:via-black/30 to-transparent rounded-b-[28px]" />
          </div>

          {/* Dock 底部阴影增强 */}
          <div className="absolute inset-x-8 -bottom-2 h-4 bg-black/5 dark:bg-black/20 blur-xl rounded-full -z-10" />
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
