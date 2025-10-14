"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as Popover from "@radix-ui/react-popover";
import { User, LogOut, Settings } from "lucide-react";

export function AvatarSection() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="cursor-pointer border-0 bg-transparent p-0 hover:opacity-80 transition-opacity">
          <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
            <Avatar.Image src="" alt="用户头像" className="w-full h-full object-cover rounded-full" />
            <Avatar.Fallback className="w-full h-full flex items-center justify-center text-white text-sm font-medium">U</Avatar.Fallback>
          </Avatar.Root>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white dark:bg-gray-900 rounded-lg p-2 z-50 focus:outline-none w-[200px] border border-gray-200 dark:border-gray-700"
          sideOffset={8}
          align="end"
        >
          <div className="flex flex-col gap-1">
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">个人中心</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left">
              <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm text-gray-900 dark:text-gray-100">设置</span>
            </button>
            <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
            <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left">
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">退出登录</span>
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
