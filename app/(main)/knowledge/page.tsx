"use client";

import {
  Database,
  Search,
  MoreVertical,
  SlidersHorizontal,
  Plus,
  Ellipsis,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

// 文件夹和文件数据结构
interface KnowledgeItem {
  id: number;
  name: string;
  type: "folder" | "file";
  children?: KnowledgeItem[];
  updatedAt?: string;
}

// 示例知识库数据（文件夹形式）
const knowledgeItems: KnowledgeItem[] = [
  {
    id: 1,
    name: "世界观设定",
    type: "folder",
    children: [
      { id: 11, name: "历史背景.md", type: "file", updatedAt: "2024-01-15" },
      { id: 12, name: "地理设定.md", type: "file", updatedAt: "2024-01-14" },
      { id: 13, name: "势力分布.md", type: "file", updatedAt: "2024-01-13" },
    ],
  },
  {
    id: 2,
    name: "角色设定",
    type: "folder",
    children: [
      { id: 21, name: "主角设定.md", type: "file", updatedAt: "2024-01-16" },
      { id: 22, name: "配角设定.md", type: "file", updatedAt: "2024-01-12" },
      {
        id: 23,
        name: "反派角色",
        type: "folder",
        children: [
          { id: 231, name: "大反派.md", type: "file", updatedAt: "2024-01-10" },
          { id: 232, name: "小反派.md", type: "file", updatedAt: "2024-01-09" },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "魔法体系.md",
    type: "file",
    updatedAt: "2024-01-17",
  },
  {
    id: 4,
    name: "科技设定.md",
    type: "file",
    updatedAt: "2024-01-11",
  },
];

// 文件夹树项组件
function FolderTreeItem({
  item,
  level = 0,
  selectedItem,
  expandedFolders,
  onSelectItem,
  onToggleFolder,
}: {
  item: KnowledgeItem;
  level?: number;
  selectedItem: number | null;
  expandedFolders: Set<number>;
  onSelectItem: (id: number) => void;
  onToggleFolder: (id: number) => void;
}) {
  const isFolder = item.type === "folder";
  const isExpanded = expandedFolders.has(item.id);
  const isSelected = selectedItem === item.id;

  return (
    <div>
      <div
        onClick={() => {
          if (isFolder) {
            onToggleFolder(item.id);
          }
          onSelectItem(item.id);
        }}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
          isSelected
            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {/* 展开/折叠图标 */}
        {isFolder && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(item.id);
            }}
            className="flex-shrink-0 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}

        {/* 文件夹/文件图标 */}
        <div className="flex-shrink-0">
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            ) : (
              <Folder className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
            )
          ) : (
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          )}
        </div>

        {/* 名称 */}
        <span className="flex-1 text-sm truncate">{item.name}</span>

        {/* 更新时间（仅文件显示） */}
        {!isFolder && item.updatedAt && <span className="text-xs text-gray-400 dark:text-gray-500">{item.updatedAt}</span>}
      </div>

      {/* 子项 */}
      {isFolder && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedItem={selectedItem}
              expandedFolders={expandedFolders}
              onSelectItem={onSelectItem}
              onToggleFolder={onToggleFolder}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Knowledge() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<number | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1, 2])); // 默认展开前两个文件夹

  // 知识库列表数据
  const knowledgeBases = [
    { id: 1, name: "世界观设定" },
    { id: 2, name: "角色设定" },
  ];

  const toggleFolder = (id: number) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  return (
    <>
      <div className="flex h-screen bg-white dark:bg-gray-900 transition-colors">
        {/* 知识库 - 固定宽度，不可拖拽 */}
        <section className="h-screen border-r border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="w-[200px]">
            <div className="w-full h-[64px] flex justify-between px-4 items-center border-b border-neutral-200 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">个人知识库</span>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
              </button>
            </div>
            {/* 知识库列表 */}
            <ul className="flex flex-col p-2">
              {knowledgeBases.map((kb) => (
                <li
                  key={kb.id}
                  onClick={() => setSelectedKnowledgeBase(kb.id)}
                  className={`p-4 rounded-md cursor-pointer transition-all ${
                    selectedKnowledgeBase === kb.id
                      ? "bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-900/50"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{kb.name}</span>
                    </div>

                    <Ellipsis className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 可调整大小的区域 - 仅在选中知识库时使用 ResizablePanelGroup */}
        {selectedKnowledgeBase !== null ? (
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            {/* 知识库列表区域 - 可拖拽调整大小 */}
            <ResizablePanel defaultSize={15} minSize={15} maxSize={20}>
              <section className="h-screen border-r border-neutral-200 dark:border-gray-800 flex flex-col">
                <div className="flex flex-col h-full">
                  {/* 顶部操作栏 */}
                  <div className="h-[64px] px-4 flex items-center justify-between border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">内容</h2>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <SlidersHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>

                  {/* 知识库列表 - 文件夹树形式 */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-neutral-50 dark:scrollbar-track-neutral-900 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                    <div className="py-2">
                      {knowledgeItems.map((item) => (
                        <FolderTreeItem
                          key={item.id}
                          item={item}
                          selectedItem={selectedItem}
                          expandedFolders={expandedFolders}
                          onSelectItem={setSelectedItem}
                          onToggleFolder={toggleFolder}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </ResizablePanel>

            <ResizableHandle className="bg-gray-200 dark:bg-gray-800 hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors" />

            {/* 内容区域 - 可拖拽调整大小 */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <section className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                  {/* 空状态图标 */}
                  <div className="mb-6">
                    <svg className="w-32 h-32 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={0.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>

                  {/* 空状态文字 */}
                  {selectedItem === null ? (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">选择一个文件查看内容</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">点击左侧文件开始编辑</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">文件内容将在这里显示</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">选中的文件内容编辑器</p>
                    </>
                  )}
                </div>
              </section>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* 未选中知识库时的内容区域 - 不使用拖拽 */
          <section className="h-screen w-full bg-white dark:bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              {/* 空状态图标 */}
              <div className="mb-6">
                <svg className="w-32 h-32 text-gray-300 dark:text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={0.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              {/* 空状态文字 */}
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">选择一个知识库开始</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">点击左侧知识库查看内容</p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
