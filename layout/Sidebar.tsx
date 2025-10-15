"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, Bot, Database, Trash2 } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import Image from "next/image";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { path: "/home", label: "新建对话", icon: Bot },
    { path: "/novels", label: "我的小说", icon: Book },
    { path: "/knowledge", label: "知识库", icon: Database },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <Tooltip.Provider delayDuration={300}>
      <aside className="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
        {/* Logo 区域 */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
          <Link href="/">
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
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.path}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <Link
                        href={item.path}
                        className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                          active
                            ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-active"
                            : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    </Tooltip.Trigger>
                    <Tooltip.Portal>
                      <Tooltip.Content
                        side="right"
                        className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg border border-gray-700"
                        sideOffset={5}
                      >
                        {item.label}
                        <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-800" />
                      </Tooltip.Content>
                    </Tooltip.Portal>
                  </Tooltip.Root>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 回收站 */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Link
                href="/trash"
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all ${
                  isActive("/trash")
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50"
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Trash2 className="w-5 h-5 text-red-500 dark:text-red-400" />
              </Link>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                className="bg-gray-900 dark:bg-gray-800 text-white text-sm px-3 py-1.5 rounded-md shadow-lg border border-gray-700"
                sideOffset={5}
              >
                回收站
                <Tooltip.Arrow className="fill-gray-900 dark:fill-gray-800" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </aside>
    </Tooltip.Provider>
  );
}
