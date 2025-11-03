"use client";

import { AvatarSection } from "./components/avatarSection";
import { ThemeSection } from "./components/themeSection";

export function Header() {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 transition-colors">
      {/* 左侧：面包屑或标题 */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200"></h2>
      </div>

      {/* 右侧 */}
      <div className="flex items-center gap-4">
        {/* 主题 */}
        <ThemeSection />
        {/* 头像 */}
        <AvatarSection />
      </div>
    </header>
  );
}
