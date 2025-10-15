"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCompositionPage = pathname === "/composition";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* 头部 */}
        <Header />

        {/* 主体内容 */}
        <main
          className={`flex-1 h-auto ${
            isCompositionPage
              ? "overflow-hidden"
              : "scrollbar-thin scrollbar-h-[10px] scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full overflow-y-scroll"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
