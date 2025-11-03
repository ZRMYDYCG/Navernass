"use client";

import * as Avatar from "@radix-ui/react-avatar";
import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { Settings, LogOut } from "lucide-react";

export function AvatarSection() {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="cursor-pointer border-0 bg-transparent p-0">
          <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-[45px] h-[45px] rounded-full bg-black/5">
            <Avatar.Image
              src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
              alt="Colm Tuite"
              className="w-full h-full object-cover rounded-full"
            />
            <Avatar.Fallback
              delayMs={600}
              className="w-full h-full flex items-center justify-center bg-white text-violet-600 text-[15px] leading-none font-medium"
            >
              CT
            </Avatar.Fallback>
          </Avatar.Root>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="popover-content rounded w-[260px] bg-white dark:bg-gray-900 p-2 z-50 focus:outline-none border border-gray-200 dark:border-gray-700"
          style={{
            boxShadow:
              "hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px",
          }}
          sideOffset={5}
          align="end"
        >
          {/* 用户信息 */}
          <div className="mb-4 flex items-center">
            <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-[45px] h-[45px] rounded-full bg-black/5 dark:bg-white/5">
              <Avatar.Image
                src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                alt="Colm Tuite"
                className="w-full h-full object-cover rounded-full"
              />
              <Avatar.Fallback
                delayMs={600}
                className="w-full h-full flex items-center justify-center bg-white dark:bg-gray-800 text-violet-600 dark:text-violet-400 text-[15px] leading-none font-medium"
              >
                CT
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="flex flex-col mx-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Colm Tuite</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">colm@example.com</p>
            </div>
          </div>

          {/* 菜单项 */}
          <div className="space-y-1">
            <Link
              href="/settings"
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>设置</span>
            </Link>
          </div>

          <Popover.Arrow className="fill-white dark:fill-gray-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
