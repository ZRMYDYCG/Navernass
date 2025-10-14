"use client";

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import * as Avatar from "@radix-ui/react-avatar";

export default function Trash() {
  return (
    <>
      <div className="flex flex-col bg-white dark:bg-gray-900 transition-colors">
        {/* 顶部封面和用户信息 */}
        <section className="relative">
          {/* 封面图片 */}
          <div className="h-32 w-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&q=80"
              alt="封面"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          {/* 用户信息卡片 */}
          <div className="relative px-6 pb-4">
            {/* 头像 */}
            <div className="absolute -top-12 left-6">
              <Avatar.Root className="inline-flex items-center justify-center align-middle overflow-hidden select-none w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 bg-gray-100 dark:bg-gray-800">
                <Avatar.Image
                  src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                  alt="用户头像"
                  className="w-full h-full object-cover rounded-full"
                />
                <Avatar.Fallback delayMs={600} className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-medium">
                  JL
                </Avatar.Fallback>
              </Avatar.Root>
            </div>

            {/* 用户信息 */}
            <div className="pt-16 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">魔法师 - Jarvis</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">将现实的伤口化作玫瑰，以创作点亮星途追逐</p>
                <p className="text-xs text-gray-500 dark:text-gray-500">ID: 12345678</p>
              </div>

              {/* 统计数据 */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">28</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">作品</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">1.2K</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">关注</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 dark:text-gray-100">856</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">粉丝</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 分段控制器 */}
        <section className="flex justify-center items-center border-t border-b border-gray-300 p-4">
          <SegmentedControl defaultValue="option1" className="w-fit">
            <SegmentedControlItem value="option1">个人资料</SegmentedControlItem>
            <SegmentedControlItem value="option2">我的小说</SegmentedControlItem>
            <SegmentedControlItem value="option3">我的收藏</SegmentedControlItem>
          </SegmentedControl>
        </section>

        {/* 内容区域 */}
        <section className="flex-1">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧：关于我 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 个人简介 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">关于我 👋</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    我是一名热爱创作的小说作者，专注于科幻、奇幻和悬疑题材。通过 NarraVerse
                    平台，我致力于打造引人入胜的故事世界，与读者分享想象力的无限可能。
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    我的使命是通过文字连接人心，分享知识，发现新的创作机会。我专注于提升创作技巧，建立伟大的社区，并为创作者开辟新的可能性。
                  </p>

                  {/* 社交链接 */}
                  <div className="mt-4 flex items-center gap-4">
                    <a href="#" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      Twitter
                    </a>
                    <a href="#" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      微博
                    </a>
                    <a href="#" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      个人网站
                    </a>
                  </div>
                </div>

                {/* 合作过的创作者 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">合作过的创作者</h3>
                  <div className="flex items-center gap-3">
                    {["张三", "李四", "王五", "赵六"].map((name) => (
                      <div key={name} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {name[0]}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 专业领域 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">擅长领域</h3>
                  <div className="flex flex-wrap gap-2">
                    {["科幻写作", "UI/UX 设计", "开源项目", "应用开发", "导师指导", "短篇创作", "领导力", "编剧", "+2"].map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 语言能力 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">语言能力</h3>
                  <div className="flex gap-2">
                    {["中文", "英语", "日语", "法语"].map((lang) => (
                      <span key={lang} className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 技能栈 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">创作工具</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Notion", "Scrivener", "Markdown", "Obsidian", "Final Draft"].map((tool) => (
                      <span key={tool} className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 右侧：社区数据 */}
              <div className="space-y-6">
                {/* 社区贡献 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">社区贡献</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 text-lg">📝</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">7,216</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">主题</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <span className="text-green-600 dark:text-green-400 text-lg">💬</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">4,812</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">回复</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                          <span className="text-purple-600 dark:text-purple-400 text-lg">📺</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">37</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">展示</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                          <span className="text-orange-600 dark:text-orange-400 text-lg">👥</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">260</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">邀请人数</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 徽章 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">成就徽章</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {["🏆", "⭐", "🎯", "🔥", "💎", "🎨", "📚", "✨"].map((badge, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-2xl hover:scale-110 transition-transform cursor-pointer"
                      >
                        {badge}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
