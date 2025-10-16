"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Bot, Database, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const menuItems = [
    { path: "/home", label: "新建对话", icon: Bot },
    { path: "/novels", label: "我的小说", icon: Book },
    { path: "/knowledge", label: "知识库", icon: Database },
    { path: "/trash", label: "回收站", icon: Trash2 },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* 切换按钮 - 始终可见 */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-t-xl px-4 py-1.5 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
        >
          {isVisible ? (
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          )}
        </button>
      </div>

      {/* macOS Dock 风格侧边栏 */}
      <Tooltip.Provider delayDuration={300}>
        <aside
          className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ease-in-out ${
            isVisible
              ? "translate-y-0 opacity-100"
              : "translate-y-full opacity-0 pointer-events-none"
          }`}
        >
          <div className="mb-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-2xl px-3 py-2">
            <div className="flex items-center gap-2">
              {/* 导航菜单 */}
              <nav className="flex items-center gap-1 px-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isTrash = item.path === "/trash";

                  return (
                    <Tooltip.Root key={item.path}>
                      <Tooltip.Trigger asChild>
                        <Link
                          href={item.path}
                          className={`group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-200 ${
                            active
                              ? "bg-black text-white shadow-lg scale-110"
                              : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105 hover:-translate-y-1"
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 transition-transform group-hover:scale-110 ${
                              isTrash && !active ? "text-red-500 dark:text-red-400" : ""
                            }`}
                          />
                          {/* 活跃指示器 */}
                          {active && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
                          )}
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-xl border border-gray-700"
                          sideOffset={10}
                        >
                          {item.label}
                          <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-800" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    </Tooltip.Root>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>
      </Tooltip.Provider>
    </>
  );
}
