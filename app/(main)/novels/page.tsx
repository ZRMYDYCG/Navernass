"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

export default function Novels() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // 示例小说数据（更多数据用于分页演示）
  const allNovels = [
    {
      id: 1,
      title: "星际迷航：无尽边界",
      description: "在浩瀚宇宙的深处，文明的交锋开启了一个全新的纪元。星际殖民者与外星巨人的战争中，见证人类文明的兴衰。",
      category: "科幻·奇幻",
      tags: ["科幻", "冒险", "太空歌剧"],
      coverImage: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&q=80",
      wordCount: "12.3k",
      updatedAt: "3小时前",
      chapters: 45,
    },
    {
      id: 2,
      title: "末世纪元",
      description: "当末日降临，人类文明化为灰烬。在废墟中求生的幸存者们，将如何重建新的世界秩序？",
      category: "末世·生存",
      tags: ["末世", "生存", "冒险"],
      coverImage: "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=800&q=80",
      wordCount: "8.7k",
      updatedAt: "1天前",
      chapters: 32,
    },
    {
      id: 3,
      title: "修真之路",
      description: "从凡人到仙人，历经九九八十一劫。看少年如何在修真界中逆天改命，成就无上大道。",
      category: "玄幻·修真",
      tags: ["修真", "热血", "升级"],
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      wordCount: "156k",
      updatedAt: "2天前",
      chapters: 521,
    },
    {
      id: 4,
      title: "都市之巅",
      description: "重生回到十年前，手握先知优势的他，将如何在都市中书写属于自己的传奇？",
      category: "都市·重生",
      tags: ["都市", "重生", "商战"],
      coverImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
      wordCount: "67k",
      updatedAt: "5小时前",
      chapters: 234,
    },
    {
      id: 5,
      title: "龙族秘闻",
      description: "混血种与纯血龙族的千年恩怨，在这个时代即将迎来最终的审判。",
      category: "奇幻·冒险",
      tags: ["龙族", "热血", "冒险"],
      coverImage: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80",
      wordCount: "89k",
      updatedAt: "12小时前",
      chapters: 312,
    },
    {
      id: 6,
      title: "灵异笔记",
      description: "世界上真的有鬼吗？当我翻开这本笔记的时候，才发现真相远比想象中更加可怕。",
      category: "悬疑·灵异",
      tags: ["悬疑", "灵异", "惊悚"],
      coverImage: "https://images.unsplash.com/photo-1465146633011-14f8e0781093?w=800&q=80",
      wordCount: "34k",
      updatedAt: "8小时前",
      chapters: 128,
    },
    {
      id: 7,
      title: "剑仙传说",
      description: "一剑破万法，剑道巅峰之上，唯有孤独相伴。少年剑客的成长之路，充满坎坷与奇遇。",
      category: "武侠·仙侠",
      tags: ["剑修", "仙侠", "热血"],
      coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&q=80",
      wordCount: "198k",
      updatedAt: "6小时前",
      chapters: 678,
    },
    {
      id: 8,
      title: "机甲战纪",
      description: "在机甲称霸的时代，驾驶员是唯一的希望。热血少年与他的机甲搭档，将守护这片星空。",
      category: "科幻·机甲",
      tags: ["机甲", "热血", "战斗"],
      coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
      wordCount: "45k",
      updatedAt: "1天前",
      chapters: 167,
    },
    {
      id: 9,
      title: "魔法学院",
      description: "在魔法的世界里，天赋决定一切。但这位少年用努力证明，没有魔法天赋也能成为强者。",
      category: "奇幻·魔法",
      tags: ["魔法", "学院", "成长"],
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      wordCount: "112k",
      updatedAt: "4小时前",
      chapters: 389,
    },
  ];

  // 分页逻辑
  const totalPages = Math.ceil(allNovels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentNovels = allNovels.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col dark:bg-gray-900 transition-colors h-auto">
      {/* 顶部区域 */}
      <section className="relative flex justify-center items-center px-6 pt-6 pb-4 flex-shrink-0">
        <Button className="absolute cursor-pointer left-6 bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700">
          <Plus className="w-4 h-4" />
          新建小说
        </Button>

        <SegmentedControl defaultValue="option1" className="w-fit">
          <SegmentedControlItem value="option1">全部</SegmentedControlItem>
          <SegmentedControlItem value="option2">我的小说</SegmentedControlItem>
          <SegmentedControlItem value="option3">收藏</SegmentedControlItem>
        </SegmentedControl>
      </section>

      {/* 小说列表区域 */}
      <div className="flex-1 px-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentNovels.map((novel) => (
            <div
              key={novel.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow border border-gray-100 dark:border-gray-700"
            >
              {/* 封面图片 */}
              <div className="relative h-[280px] overflow-hidden">
                <img src={novel.coverImage} alt={novel.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-2 left-2">
                  <span className="inline-block px-2.5 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-200 rounded-full">
                    {novel.category}
                  </span>
                </div>
              </div>

              {/* 内容区域 */}
              <div className="p-4">
                {/* 标题 */}
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">{novel.title}</h3>

                {/* 描述 */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{novel.description}</p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {novel.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 统计信息 */}
                <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>{novel.chapters} 章</span>
                    <span>·</span>
                    <span>{novel.wordCount}</span>
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">{novel.updatedAt}</span>
                </div>

                {/* 开始创作按钮 */}
                <Button
                  className="w-full bg-black dark:bg-gray-700 text-white h-8 text-sm hover:bg-gray-800 dark:hover:bg-gray-600"
                  onClick={() => {
                    router.push("/novels/editor");
                  }}
                >
                  开始创作
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {currentNovels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <p className="text-lg mb-4">还没有小说</p>
            <Button className="bg-black dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700">
              <Plus className="w-4 h-4" />
              创建第一部小说
            </Button>
          </div>
        )}
      </div>

      {/* 底部分页 */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 py-4 px-6 border-t border-gray-200 dark:border-gray-800">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // 显示当前页、首页、末页以及当前页附近的页码
                if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                return null;
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
