"use client";

import { SwatchBook, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import * as Popover from "@radix-ui/react-popover";

export function ThemeSection() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="cursor-pointer border-0 bg-transparent p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
          <SwatchBook className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white dark:bg-gray-900 rounded-lg p-3 z-50 focus:outline-none w-[240px] border border-gray-200 dark:border-gray-700"
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
